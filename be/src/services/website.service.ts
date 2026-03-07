import { prisma } from "../configs/db.js";
import { processUnembeddedChunks } from "./embedding.service.js";
import { scrapeWebsiteRecursively } from "./scraping.service.js";
import { chunkContent } from "./contentProcessor.service.js";
import { v4 as uuidv4 } from 'uuid';
import { PDFParse } from 'pdf-parse';
import { widgetConfigSchema, type WidgetConfig, type RegisterWebsiteOptions } from "../zod/website.js";

export async function registerWebsite(customerId: string, opts: RegisterWebsiteOptions): Promise<{ id: number; api_secret: string }> {
  const { name, url, textContent, fileBuffer, fileName } = opts;

  let domain: string;
  let websiteName: string;

  if (url) {
    let validUrl: URL;
    try {
      validUrl = new URL(url);
      if (!validUrl.protocol.startsWith('http')) {
        throw new Error("URL must start with http:// or https://");
      }
    } catch {
      throw new Error("Please enter a valid URL (e.g., https://example.com)");
    }
    domain = validUrl.hostname;
    websiteName = name || domain;

    const existing = await prisma.website.findUnique({
      where: { customerId_domain: { customerId, domain } }
    });
    if (existing) throw new Error("This website is already registered in your account");
  } else if (fileBuffer || textContent) {
    const slug = (name || fileName || 'custom-content')
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .slice(0, 60);
    domain = `${slug}-${Date.now()}`;
    websiteName = name || fileName || 'Custom Content';
  } else {
    throw new Error("Provide a URL, a file, or text content");
  }

  const api_secret = uuidv4();

  const website = await prisma.website.create({
    data: { customerId, domain, name: websiteName, status: "pending", api_secret }
  });

  if (url) {
    scrapeWebsiteRecursively(url, website.id)
      .then(() => processAllEmbeddings(website.id))
      .catch(error => {
        console.error(`Error processing website ${url}:`, error);
        prisma.website.update({ where: { id: website.id }, data: { status: 'failed' } }).catch(console.error);
      });
  } else {
    processUploadedContent(website.id, { fileBuffer, fileName, textContent }).catch(error => {
      console.error(`Error processing uploaded content:`, error);
      prisma.website.update({ where: { id: website.id }, data: { status: 'failed' } }).catch(console.error);
    });
  }

  return { id: website.id, api_secret };
}

async function processUploadedContent(
  websiteId: number,
  opts: { fileBuffer?: Buffer; fileName?: string; textContent?: string }
): Promise<void> {
  try {
    let rawText = '';

    if (opts.fileBuffer && opts.fileName) {
      const lowerName = opts.fileName.toLowerCase();
      if (lowerName.endsWith('.pdf')) {
        const parser = new PDFParse({ data: opts.fileBuffer });
        const result = await parser.getText();
        rawText = result.text;
      } else {
        rawText = opts.fileBuffer.toString('utf-8');
      }
    } else if (opts.textContent) {
      rawText = opts.textContent;
    }

    if (!rawText.trim()) {
      await prisma.website.update({ where: { id: websiteId }, data: { status: 'failed' } });
      return;
    }

    const pageUrl = `custom://upload/${websiteId}`;
    const page = await prisma.page.create({
      data: {
        websiteId,
        url: pageUrl,
        title: 'Uploaded Content',
        status: 'scraped',
        lastCrawledAt: new Date(),
      }
    });

    const chunks = chunkContent(rawText);
    for (let i = 0; i < chunks.length; i++) {
      await prisma.chunk.create({
        data: {
          pageId: page.id,
          chunkIndex: i,
          text: chunks[i].text,
          tokenCount: Math.ceil(chunks[i].text.length / 4),
        }
      });
    }

    await processAllEmbeddings(websiteId);
  } catch (error) {
    console.error(`Error in processUploadedContent for website ${websiteId}:`, error);
    await prisma.website.update({ where: { id: websiteId }, data: { status: 'failed' } });
  }
}

async function processAllEmbeddings(websiteId: number): Promise<void> {
  try {
    const chunkCount = await prisma.chunk.count({
      where: {
        Page: {
          websiteId
        }
      }
    });

    if (chunkCount === 0) {
      await prisma.website.update({
        where: { id: websiteId },
        data: { status: 'failed' }
      });
      throw new Error("We couldn't find any content to process on this website. Please try a different website with more textual content.");
    }

    await prisma.website.update({
      where: { id: websiteId },
      data: { status: 'embedding' }
    });

    let processedCount = 0;
    let batchCount = 0;
    let totalProcessed = 0;

    do {
      try {
        processedCount = await processUnembeddedChunks(30);
        totalProcessed += processedCount;
        batchCount++;

        if (processedCount > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`Error processing embedding batch ${batchCount}:`, error);
      }
    } while (processedCount > 0 && batchCount < 100);

    if (totalProcessed === 0) {
      await prisma.website.update({
        where: { id: websiteId },
        data: { status: 'failed' }
      });
      throw new Error("We encountered an issue while processing your website content. Our embedding system couldn't process the extracted text. Please try a different website.");
    } else {
      await prisma.website.update({
        where: { id: websiteId },
        data: { status: 'completed' }
      });
    }
  } catch (error) {
    console.error(`Error in embedding process for website ${websiteId}:`, error);
    await prisma.website.update({
      where: { id: websiteId },
      data: { status: 'failed' }
    });
    throw error;
  }
}

export async function updateKnowledgeService(
  websiteId: number,
  mode: 'reset' | 'append',
  opts: { fileBuffer?: Buffer; fileName?: string; textContent?: string }
): Promise<void> {
  const website = await prisma.website.findUnique({ where: { id: websiteId } });
  if (!website) throw new Error('Website not found');

  if (mode === 'reset') {
    await prisma.page.deleteMany({ where: { websiteId } });
  }

  await prisma.website.update({ where: { id: websiteId }, data: { status: 'pending' } });

  processUploadedContent(websiteId, opts).catch(error => {
    console.error(`Error in updateKnowledge for website ${websiteId}:`, error);
    prisma.website.update({ where: { id: websiteId }, data: { status: 'failed' } }).catch(console.error);
  });
}

export async function getWebsitesService(userId: string){

  if(!userId) {
    throw new Error("User ID is required");
  }

  if(typeof userId !== 'string') {
    throw new Error("User ID must be a string");
  }

  return prisma.website.findMany({
    where: {
      customerId: userId
    }
  });
}

export async function getWebsiteInfoService(websiteId: number): Promise<any> {
  return prisma.website.findUnique({
    where: { id: websiteId }
  });
}

export async function generateSecret(websiteId: number): Promise<string> {
  const secret = uuidv4();
  await prisma.website.update({
    where: { id: websiteId },
    data: { api_secret: secret }
  });
  return secret;
}

export async function getWidgetConfigService(websiteId: number) {
  return prisma.website.findUnique({
    where: { id: websiteId },
  });
}

export async function updateWidgetConfigService(websiteId: number, config: WidgetConfig): Promise<void> {
  const validatedConfig = widgetConfigSchema.parse(config);
  await prisma.website.update({
    where: { id: websiteId },
    data: validatedConfig
  });
}
