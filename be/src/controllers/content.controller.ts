import express from 'express';
import router from '../routes/user.route.js';
import { Request, Response } from 'express';
import { registerWebsite as registerWebsiteService } from '../services/website.service.js';
import { generateChatResponse } from '../services/chat.service.js';


// Register a new website
export const registerWebsite = async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    const customerId = req.user?.userId;
    
    if (!url || !customerId) {
      res.status(400).json({ error: 'Missing required parameters' });
      return;
    }
    
    const websiteId = await registerWebsiteService(customerId, url);
    
    res.status(201).json({
      websiteId,
      status: 'pending',
      message: 'Website registration successful. Processing started.'
    });
  } catch (error) {
    console.error('Website registration error:', error);
    res.status(500).json({ error: 'Failed to register website' });
  }
};

// Get website status
// export const getWebsiteStatus = async (req: Request, res: Response) => {
//   try {
//     const websiteId = parseInt(req.params.id);
    
//     if (isNaN(websiteId)) {
//       return res.status(400).json({ error: 'Invalid website ID' });
//     }
    
//     const status = await getWebsiteStatus(websiteId);
//     res.json(status);
//   } catch (error) {
//     console.error('Get website status error:', error);
//     res.status(404).json({ error: 'Website not found' });
//   }
// }

// Chat endpoint
export const chat = async (req: Request, res: Response) => {
  try {
    const { query, websiteId } = req.body;
    
    if (!query || !websiteId) {
      res.status(400).json({ error: 'Missing required parameters' });
      return;
    }
    
    const response = await generateChatResponse(query, websiteId);
    res.json(response);
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
};
export default router;