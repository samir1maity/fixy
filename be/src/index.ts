import express from "express";
import "dotenv/config";
import { registerWebsite } from "./services/website.service.js";
import chatRouter from "./routes/chat.route.js";
// import { scrapeGenericWebsite } from "./services/website.service.js";
// import { chunkContent } from "./services/contentProcessor.service.js";

const app = express();
app.use(express.json());


app.use('/', chatRouter)

// const scrape = async () => {
//   const data = await scrapeGenericWebsite("https://www.piyushgarg.dev");
//   console.log(data);
//   const chunks = chunkContent(data.content, "hi hello");
//   console.log(chunks);
// };
// scrape();

registerWebsite('customerId', 'https://samir.me');

app.listen(3000, () => {
  console.log("server started at port 3000 ");
});
