import express from "express";
import "dotenv/config";
import chatRouter from "./routes/chat.route.js";
import userRoutes from './routes/user.route.js';
import cors from 'cors';
import { optionalAuth } from './middlewares/auth.middleware.js';
import websiteRouter from "./routes/website.route.js";

const app = express();
app.use(express.json());

app.use(cors());

app.use(
  cors({
    origin: "http://localhost:8080", 
    allowedHeaders: ["Content-Type", "Authorization"], 
    credentials: true, 
  })
);

// app.use(optionalAuth);

app.use('/api/v1/chat', chatRouter)
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/websites', websiteRouter);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
