import { Request, Response, Router } from "express";
import { generateChatResponse, generateSessionId, getChatHistory,  } from "../services/chat.service.js";
import { authenticateChat } from "../middlewares/auth.middleware.js";
import * as chatController from "../controllers/chat.controller.js";

const chatRouter = Router();

chatRouter.post('/', authenticateChat, chatController.chat);

export default chatRouter;