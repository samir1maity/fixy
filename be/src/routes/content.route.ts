import { Router } from "express";
import { chat, registerWebsite } from "../controllers/content.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const contentRouter = Router();

contentRouter.post("/api/websites", authenticate, registerWebsite);
contentRouter.post("/api/chat", chat);

export default contentRouter;