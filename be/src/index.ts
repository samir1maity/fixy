import express from "express";
import "dotenv/config";
import chatRouter from "./routes/chat.route.js";
import userRoutes from './routes/user.route.js';
import cors from 'cors';
import websiteRouter from "./routes/website.route.js";
import analyticsRouter from "./routes/analytics.route.js";

const app = express();
app.use(express.json());

app.use(cors());

app.use(
  cors({
    origin: "https://fixy.iamsamir.space", 
    allowedHeaders: ["Content-Type", "Authorization"], 
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


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
