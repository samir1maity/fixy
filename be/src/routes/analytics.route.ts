import { Router } from "express";
import { getUserChatStats, getWebsiteChatStats } from "../controllers/analytics.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const analyticsRouter = Router();

analyticsRouter.get("/user-chat-stats", authenticate, getUserChatStats);
analyticsRouter.get("/website-chat-stats/:websiteId", authenticate, getWebsiteChatStats);

export default analyticsRouter;
