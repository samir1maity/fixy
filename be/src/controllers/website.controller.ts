import { Request, Response } from 'express';
import { generateSecret, getWebsiteInfoService, getWebsitesService, registerWebsite as registerWebsiteService } from '../services/website.service.js';

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
    console.log('websiteId -->', websiteId);
    res.status(201).json({
      websiteId,
      status: 'pending',
      message: 'Website registration successful. Processing started.'
    });
  } catch (error) {
    console.error('Website registration error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to register website';
    res.status(400).json({ error: errorMessage });
  }
};

export const getWebsites = async (req: Request, res: Response) => {
  try {
    const customerId = req.user?.userId;
    
    if (!customerId || typeof customerId !== 'string') {
      res.status(400).json({ error: 'Missing required parameters' });
      return;
    }
    
    const websites = await getWebsitesService(customerId);
    
    // For each failed website, add a generic error message if not already present
    const websitesWithMessages = websites.map(website => {
      if (website.status === 'failed') {
        return {
          ...website,
          statusMessage: "Processing failed. Please try a different website or contact support."
        };
      }
      return website;
    });
    
    res.json(websitesWithMessages);
  } catch (error) { 
    console.error('Get websites error:', error);
    res.status(500).json({ error: 'Failed to get websites' });
  }
};

export const getWebsiteInfo = async (req: Request, res: Response) => {
  try {
    const id = Number(req?.params?.id);
    if (!id || isNaN(Number(id))) {
      res.status(400).json({ error: 'Missing required parameters' }); 
      return;
    }
    const website = await getWebsiteInfoService(id);
    
    // Add a generic error message if the website failed and no message is present
    if (website && website.status === 'failed' && !website.statusMessage) {
      website.statusMessage = "Processing failed. Please try a different website or contact support.";
    }
    
    res.json(website);
  } catch (error) {
    console.error('Get website info error:', error);  
    res.status(500).json({ error: 'Failed to get website info' });
  }
};


export const regenerateSecret = async (req: Request, res: Response) => {
  try {
    const id = Number(req?.params?.id);
    if (!id || isNaN(Number(id))) {
      res.status(400).json({ error: 'Missing required parameters' });
      return;
    }
    const secret = await generateSecret(id);
    res.json({ secret });
  } catch (error) {
    console.error('Generate secret error:', error);
    res.status(500).json({ error: 'Failed to generate secret' });
  }
}
