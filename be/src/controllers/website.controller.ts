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
    res.status(500).json({ error: 'Failed to register website' });
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
    res.json(websites);
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
