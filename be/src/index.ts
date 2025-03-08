import express from "express";
import "dotenv/config";
import { registerWebsite } from "./services/website.service.js";
import chatRouter from "./routes/chat.route.js";
import userRoutes from './routes/user.route.js';
import { optionalAuth } from './middlewares/auth.middleware.js';
// import { scrapeGenericWebsite } from "./services/website.service.js";
// import { chunkContent } from "./services/contentProcessor.service.js";

const app = express();
app.use(express.json());

// Apply optional authentication to all routes
app.use(optionalAuth);

app.use('/', chatRouter)
app.use('/api/v1/users', userRoutes);

// const scrape = async () => {
//   const data = await scrapeGenericWebsite("https://www.piyushgarg.dev");
//   console.log(data);
//   const chunks = chunkContent(data.content, "hi hello");
//   console.log(chunks);
// };
// scrape();

// registerWebsite('customerId', 'https://samir.me');

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
