import { prisma } from "../configs/db.js";
import { processUnembeddedChunks } from "./embedding.service.js";
import { scrapeWebsiteRecursively } from "./scraping.service.js";

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

    // If not, create a new website
    const website = await prisma.website.create({
      data: {
        customerId,
        domain,
        // name: new URL(domain).hostname,
        status: "pending"
      }
    });

  // Start scraping process in background
  scrapeWebsiteRecursively(url, website.id)
    .then(() => {
      // After scraping is done, start embedding generation
      return processAllEmbeddings(website.id);
    })
    .catch(error => {
      console.error(`Error processing website ${url}:`, error);
      // Update status to failed Todo: Implement this
      prisma.website.update({
        where: { id: website.id },
        data: { status: 'failed' }
      }).catch(console.error);
    });
  
  return website.id;
}

async function processAllEmbeddings(websiteId: number): Promise<void> {
  // Update website status Todo: Implement this
  await prisma.website.update({
    where: { id: websiteId },
    data: { status: 'embedding' }
  });
  
  // Process in batches until all chunks have embeddings
  let processedCount = 0;
  let batchCount = 0;
  
  do {
    processedCount = await processUnembeddedChunks(30);
    batchCount++;
    
    // Add a small delay between batches
    if (processedCount > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  } while (processedCount > 0 && batchCount < 100); // Safety limit
  
  // Update website status to completed Todo: Implement this
    await prisma.website.update({
      where: { id: websiteId },
      data: { status: 'completed' }
    });
}