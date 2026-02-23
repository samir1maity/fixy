import express from "express";
import "dotenv/config";
import { connectDb } from "./configs/db.js";
import chatRouter from "./routes/chat.route.js";
import userRoutes from './routes/user.route.js';
import cors from 'cors';
import websiteRouter from "./routes/website.route.js";
import analyticsRouter from "./routes/analytics.route.js";
import config from "./configs/config.js"

const app = express();
app.use(express.json());

console.log('config.frontend.baseUrl', config.frontend.baseUrl)

app.use(
  cors({
    origin: config.frontend.baseUrl ? [config.frontend.baseUrl] : [], 
    allowedHeaders: ["Content-Type", "Authorization", "x-api-secret"], 
    credentials: true, 
  })
);

app.get('/',(req,res)=>{
  res.send("welcome to fixy backend");
})

app.use('/api/v1/chat', chatRouter)
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/websites', websiteRouter);
app.use('/api/v1/analytics', analyticsRouter);


const PORT = process.env.PORT || 3111;

connectDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
    process.exit(1);
  });
