import { prisma } from "../configs/db.js";
import { processUnembeddedChunks } from "./embedding.service.js";
import { scrapeGenericWebsite } from "./scraping.service.js";

export async function registerWebsite(customerId: string, url: string): Promise<number> {
  const domain = new URL(url).hostname;
  
  // Create website record
  const website = await prisma.website.create({
    data: {
      customerId,
      domain,
      status: 'pending'
    }
  });
  
  // Start scraping process in background
  scrapeGenericWebsite(url)
    .then(() => {
      // After scraping is done, start embedding generation
      return processAllEmbeddings(website.id);
    })
    .catch(error => {
      console.error(`Error processing website ${url}:`, error);
      // Update status to failed
      prisma.website.update({
        where: { id: website.id },
        data: { status: 'failed' }
      }).catch(console.error);
    });
  
  return website.id;
}

async function processAllEmbeddings(websiteId: number): Promise<void> {
  // Update website status
  await prisma.website.update({
    where: { id: websiteId },
    data: { status: 'embedding' }
  });
  
  // Process in batches until all chunks have embeddings
  let processedCount = 0;
  let batchCount = 0;
  
  do {
    processedCount = await processUnembeddedChunks(20);
    batchCount++;
    
    // Add a small delay between batches
    if (processedCount > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  } while (processedCount > 0 && batchCount < 100); // Safety limit
  
  // Update website status to completed
  await prisma.website.update({
    where: { id: websiteId },
    data: { status: 'completed' }
  });
}