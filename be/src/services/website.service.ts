import { prisma } from "../configs/db.js";
import { processUnembeddedChunks } from "./embedding.service.js";
import { scrapeWebsiteRecursively } from "./scraping.service.js";
import { v4 as uuidv4 } from 'uuid';

export async function registerWebsite(customerId: string, url: string): Promise<number> {
  try {
    // Validate URL
    let validUrl: URL;
    try {
      validUrl = new URL(url);
      if (!validUrl.protocol.startsWith('http')) {
        throw new Error("URL must start with http:// or https://");
      }
    } catch (error) {
      throw new Error("Please enter a valid URL (e.g., https://example.com)");
    }
    
    const domain = validUrl.hostname;
    
    // Check if website already exists
    const existingWebsite = await prisma.website.findUnique({
      where: {
        customerId_domain: {
          customerId,
          domain
        }
      }
    });

    if (existingWebsite) {
      console.log(`Website ${domain} already registered for customer ${customerId}`);
      throw new Error("This website is already registered in your account");
    }

    const api_secret = uuidv4();

    // Create the website record
    const website = await prisma.website.create({
      data: {
        customerId,
        domain,
        name: domain,
        status: "pending",
        api_secret
      }
    });

    // Start the scraping process in the background
    scrapeWebsiteRecursively(url, website.id)
      .then(() => {
        return processAllEmbeddings(website.id);
      })
      .catch(error => {
        console.error(`Error processing website ${url}:`, error);
        prisma.website.update({
          where: { id: website.id },
          data: { 
            status: 'failed'
          }
        }).catch(console.error);
      });
    
    return website.id;
  } catch (error) {
    console.error(`Error registering website ${url}:`, error);
    throw error;
  }
}

async function processAllEmbeddings(websiteId: number): Promise<void> {
  try {
    // First check if there are any chunks to embed
    const chunkCount = await prisma.chunk.count({
      where: {
        Page: {
          websiteId
        }
      }
    });
    
    if (chunkCount === 0) {
      // No chunks found, mark as failed
      await prisma.website.update({
        where: { id: websiteId },
        data: { status: 'failed' }
      });
      throw new Error("We couldn't find any content to process on this website. Please try a different website with more textual content.");
    }
    
    // Update website status to embedding
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
        // Continue with next batch even if one fails
      }
    } while (processedCount > 0 && batchCount < 100); 
    
    // Check if we successfully embedded any chunks
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
    // Mark as failed if any error occurs in the overall process
    await prisma.website.update({
      where: { id: websiteId },
      data: { status: 'failed' }
    });
    throw error; // Propagate the error to be caught by the controller
  }
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
