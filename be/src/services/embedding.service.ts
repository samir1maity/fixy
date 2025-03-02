import { pipeline } from "@xenova/transformers";

// Remove top-level await and use a function instead
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

export const getEmbedding = async (text: string) => {
  const model = await initializeModel();
  const output1 = await model('text', {
    pooling: "mean",
    normalize: true,
  });

  return Array.from(output1.data);
};