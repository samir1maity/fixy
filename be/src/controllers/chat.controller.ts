import { Request, Response } from "express";
import { generateChatResponse, generateSessionId, getChatHistory,  } from "../services/chat.service.js";


export const chat = async (req: Request, res: Response) => {
  try {
    const { query, sessionId } = req.body;
    const websiteId = req.website?.websiteId;

    if (!query || !websiteId) {
      res.status(400).json({ error: "Missing required parameters" });
      return;
    }

    let chatHistory: Array<{ role: string; content: string }> = [];
    if (sessionId) {
      chatHistory = await getChatHistory(sessionId);
    }

    const response = await generateChatResponse(query, websiteId, chatHistory);

    res.json({
      ...response,
      sessionId: sessionId || generateSessionId(),
    });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Failed to generate response" });
  }
};
