import { prisma } from "../configs/db.js";
import { processUnembeddedChunks } from "./embedding.service.js";
import { scrapeWebsiteRecursively } from "./scraping.service.js";
import { v4 as uuidv4 } from 'uuid';

export async function registerWebsite(customerId: string, url: string): Promise<number> {
  const domain = new URL(url).hostname;
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
    throw new Error("Website already registered");
  }

  const api_secret = uuidv4();

  const website = await prisma.website.create({
    data: {
      customerId,
      domain,
      // name: new URL(domain).hostname,
      status: "pending",
      api_secret
    }
  });

  scrapeWebsiteRecursively(url, website.id)
    .then(() => {
      return processAllEmbeddings(website.id);
    })
    .catch(error => {
      console.error(`Error processing website ${url}:`, error);
      prisma.website.update({
        where: { id: website.id },
        data: { status: 'failed' }
      }).catch(console.error);
    });
  
  return website.id;
}

async function processAllEmbeddings(websiteId: number): Promise<void> {
  await prisma.website.update({
    where: { id: websiteId },
    data: { status: 'embedding' }
  });
  
  let processedCount = 0;
  let batchCount = 0;
  
  do {
    processedCount = await processUnembeddedChunks(30);
    batchCount++;
    
    if (processedCount > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  } while (processedCount > 0 && batchCount < 100); 
  
  await prisma.website.update({
    where: { id: websiteId },
    data: { status: 'completed' }
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
