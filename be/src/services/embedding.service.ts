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
  // Convert embedding array to Buffer for storage
  // const vector = Buffer.from(new Float32Array(embedding).buffer);
  
  await prisma.embedding.create({
    data: {
      chunkId,
      modelName: 'all-MiniLM-L6-v2',
      dimensions: embedding.length,
      vector
    }
  });
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

// export async function retrieveSimilarChunks(
//   query: string, 
//   websiteId: number, 
//   limit: number = 5
// ): Promise<any[]> {
  // const queryEmbedding = await getEmbedding(query);
  // const queryVector = Buffer.from(new Float32Array(queryEmbedding).buffer);
  
  // Using raw query for vector similarity search
  // Note: This requires pgvector extension in PostgreSQL
  // const results = await prisma.$queryRaw`
  //   SELECT c.id, c.text, p.url, p.title
  //   FROM "Chunk" c
  //   JOIN "Page" p ON c."pageId" = p.id
  //   JOIN "Embedding" e ON e."chunkId" = c.id
  //   WHERE p."websiteId" = ${websiteId}
  //   ORDER BY e.vector <-> ${queryVector}::vector
  //   LIMIT ${limit}
  // `;
  
  // return results;
// }