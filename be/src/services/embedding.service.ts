import { pipeline } from "@xenova/transformers";
import { prisma } from "../configs/db.js";
import crypto from "crypto";

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

 const getEmbedding = async (text: string): Promise<number[]> => {
  const model = await initializeModel();
  const output1 = await model(text, {
    pooling: "mean",
    normalize: true,
  });

  return Array.from(output1.data);
};

export function formatArrayAsVectorString (arr: number[]): string {
  return `[${arr.join(",")}]`;
}

export async function storeEmbedding(chunkId: string, embedding: any): Promise<void> {
  const vectorArrayLiteral = formatArrayAsVectorString(embedding);
  const now = new Date();
  const id = crypto.randomUUID();

  const result = await prisma.$executeRaw`
      INSERT INTO "Embedding" (
        "id",
        "chunkId",
        "modelName",
        "dimensions",
        "embedding",
        "createdAt",
        "updatedAt"
      )
      VALUES (
        ${id},
        ${chunkId},
        'all-MiniLM-L6-v2',
        ${embedding.length},
        ${vectorArrayLiteral}::vector,
        ${now},
        ${now}
      );
    `;
}

export async function processUnembeddedChunks(batchSize: number = 10): Promise<number> {
  try {
    const chunks = await prisma.chunk.findMany({
      where: {
        Embeddings: {
          none: {}
        }
      },
      take: batchSize
    });
    
    if (chunks.length === 0) {
      return 0;
    }
    
    let processedCount = 0;
    
    for (const chunk of chunks) {
      try {
        if (!chunk.text || chunk.text.trim().length < 10) {
          console.warn(`Skipping chunk ${chunk.id} due to insufficient text`);
          continue;
        }
        
        const embedding = await getEmbedding(chunk.text);
        
        if (!embedding || embedding.length === 0) {
          console.warn(`Failed to generate embedding for chunk ${chunk.id}`);
          continue;
        }
        
        await storeEmbedding(chunk.id, embedding);
        processedCount++;
      } catch (error) {
        console.error(`Error processing chunk ${chunk.id}:`, error);
        // Continue with other chunks even if one fails
      }
    }
    
    return processedCount;
  } catch (error) {
    console.error("Error in processUnembeddedChunks:", error);
    return 0;
  }
}

export async function retrieveSimilarChunks(
  query: string, 
  websiteId: number, 
  limit: number = 3
): Promise<any[]> {
  const queryEmbedding = await getEmbedding(query);
  const queryVector = formatArrayAsVectorString(queryEmbedding);
  
  const results = await prisma.$queryRaw<any[]>`
    SELECT c.id, c.text, p.url, p.title
    FROM "Chunk" c
    JOIN "Page" p ON c."pageId" = p.id
    JOIN "Embedding" e ON e."chunkId" = c.id
    WHERE p."websiteId" = ${websiteId}::integer
    ORDER BY e.embedding <-> ${queryVector}::vector
    LIMIT ${limit}
  `;
  
  return results;
}