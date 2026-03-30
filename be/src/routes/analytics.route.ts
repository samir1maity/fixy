import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
  getUserChatStats,
  getWebsiteAnalytics,
  getSessionMessages,
} from "../controllers/analytics.controller.js";

const analyticsRouter = Router();

analyticsRouter.use(authenticate);

analyticsRouter.get("/user-chat-stats", getUserChatStats);
analyticsRouter.get("/website/:websiteId", getWebsiteAnalytics);
analyticsRouter.get("/session/:sessionId/messages", getSessionMessages);

export default analyticsRouter;
