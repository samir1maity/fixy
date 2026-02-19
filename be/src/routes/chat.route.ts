import { Router } from "express";
import { authenticateChat } from "../middlewares/auth.middleware.js";
import * as chatController from "../controllers/chat.controller.js";

const chatRouter = Router();

chatRouter.post('/', authenticateChat, chatController.chat);

export default chatRouter;