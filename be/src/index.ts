import express from "express";
import { chunkContent, scrapeGenericWebsite } from "./configs/contentProcessing.js";
import { getEmbedding } from "./configs/embeddings.js";

const app = express();

const scrape = async () => {
  const data = await scrapeGenericWebsite('https://harkirat.classx.co.in');
  console.log(data);
  //@ts-ignore
    data.links.internal.map( async (link)=>{
        const temp = await scrapeGenericWebsite(`https://harkirat.classx.co.in/new-courses${link}`);
        console.log(temp);
    })
};
scrape();

const embedding = await getEmbedding("Hello, world!");
console.log(embedding);

app.listen(3000, () => {
  console.log("server started at port 3000 ");
});
