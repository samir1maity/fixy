import { pipeline } from "@xenova/transformers";
import { prisma } from "../configs/db.js";

let embeddingModel: any = null;

const initializeModel = async () => {
  if (!embeddingModel) {
    embeddingModel = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );
  }
  return embeddingModel;
};

 const getEmbedding = async (text: string) => {
  const model = await initializeModel();
  const output1 = await model(text, {
    pooling: "mean",
    normalize: true,
  });

  return Array.from(output1.data);
};

export async function storeEmbedding(chunkId: string, embedding: any): Promise<void> {

}

export async function processUnembeddedChunks(batchSize: number = 10): Promise<number> {
  const chunks = await prisma.chunk.findMany({
    where: {
      Embeddings: {
        none: {}
      }
    },
    take: batchSize
  });
  
  let processedCount = 0;
  
  for (const chunk of chunks) {
    try {
      const embedding = await getEmbedding(chunk.text);
      await storeEmbedding(chunk.id, embedding);
      processedCount++;
    } catch (error) {
      console.error(`Error processing chunk ${chunk.id}:`, error);
    }
  }
  
  return processedCount;
}

