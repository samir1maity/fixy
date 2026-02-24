import express from "express";
import "dotenv/config";
import { connectDb } from "./configs/db.js";
import chatRouter from "./routes/chat.route.js";
import userRoutes from './routes/user.route.js';
import cors from 'cors';
import websiteRouter from "./routes/website.route.js";
import analyticsRouter from "./routes/analytics.route.js";
import config from "./configs/config.js"
import type { CorsOptions } from "cors";

const app = express();
app.use(express.json());

const dashboardOrigins = (config.frontend.baseUrl || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const dashboardCorsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (dashboardOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("Not allowed by CORS"));
  },
  allowedHeaders: ["Content-Type", "Authorization", "x-api-secret"],
  credentials: true,
};

const chatCorsOptions: CorsOptions = {
  origin: true,
  allowedHeaders: ["Content-Type", "Authorization", "x-api-secret"],
  credentials: false,
};

app.get('/',(req,res)=>{
  res.send("welcome to fixy backend");
})

app.use('/api/v1/chat', cors(chatCorsOptions), chatRouter)
app.use(cors(dashboardCorsOptions));
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
