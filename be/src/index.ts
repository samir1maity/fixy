import express from "express";
import "dotenv/config";
import { scrapeGenericWebsite } from "./services/website.service.js";
import { chunkContent } from "./services/contentProcessor.service.js";

const app = express();
app.use(express.json());

const scrape = async () => {
  const data = await scrapeGenericWebsite("https://www.piyushgarg.dev");
  console.log(data);
//   const chunks = chunkContent(data.content, "hi hello");
//   console.log(chunks);
};
scrape();

app.listen(3000, () => {
  console.log("server started at port 3000 ");
});
