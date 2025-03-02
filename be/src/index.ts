import express from "express";
import { chunkContent, scrapeGenericWebsite } from "./configs/contentProcessing.js";
import { getEmbedding } from "./configs/embeddings.js";

const app = express();

const scrape = async () => {
  const data = await scrapeGenericWebsite("https://www.piyushgarg.dev/");
  console.log(data);
  const chunks = chunkContent(data.content, data.links);
  console.log(chunks);
};
scrape();

const embedding = await getEmbedding("Hello, world!");
console.log(embedding);

app.listen(3000, () => {
  console.log("server started at port 3000 ");
});
