import { Request, Response, Router } from "express";
import { generateChatResponse, generateSessionId, getChatHistory,  } from "../services/chat.service.js";

const chatRouter = Router();

// Chat endpoint with session support
chatRouter.post('/', (req: Request, res: Response) => {
    (async () => {  
    try {
      const { query, websiteId, sessionId } = req.body;
      
      if (!query || !websiteId) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }
      
      // Get chat history if sessionId is provided
      let chatHistory: Array<{role: string, content: string}> = [];
      if (sessionId) {
        chatHistory = await getChatHistory(sessionId);
      }
      
      // Generate response with history context
      const response = await generateChatResponse(query, websiteId, chatHistory);
      
      // Return response with session ID for continuity
      res.json({
        ...response,
        sessionId: sessionId || generateSessionId()
      });
    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({ error: 'Failed to generate response' });
    }
  })();
});

export default chatRouter;