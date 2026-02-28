import { Request, Response } from 'express';
import { generateSecret, getWebsiteInfoService, getWebsitesService, getWidgetConfigService, registerWebsite as registerWebsiteService, updateWidgetConfigService } from '../services/website.service.js';
import * as websiteValidation from '../zod/website.js';

export const registerWebsite = async (req: Request, res: Response) => {
  try {
    const parsedCustomerId = websiteValidation.customerIdSchema.safeParse(req.user?.userId);
    if (!parsedCustomerId.success) {
      res.status(400).json({ error: 'Missing required parameters' });
      return;
    }

    const customerId = parsedCustomerId.data;

    const { url, name, textContent } = req.body;
    const file = (req as any).file as Express.Multer.File | undefined;

    const parsedOptions = websiteValidation.registerWebsiteOptionsSchema.safeParse({
      name,
      url,
      textContent,
      fileBuffer: file?.buffer,
      fileName: file?.originalname,
    });
    if (!parsedOptions.success) {
      res.status(400).json({ error: parsedOptions.error.issues[0]?.message || 'Invalid request data' });
      return;
    }
    const options = parsedOptions.data;

    const result = await registerWebsiteService(customerId, options);

    res.status(201).json({
      id: result.id,
      api_secret: result.api_secret,
      status: 'pending',
      message: 'Processing started.'
    });
  } catch (error) {
    console.error('Website registration error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to register website';
    res.status(400).json({ error: errorMessage });
  }
};

export const getWebsites = async (req: Request, res: Response) => {
  try {
    const parsedCustomerId = websiteValidation.customerIdSchema.safeParse(req.user?.userId);
    if (!parsedCustomerId.success) {
      res.status(400).json({ error: 'Missing required parameters' });
      return;
    }

    const customerId = parsedCustomerId.data;
    
    const websites = await getWebsitesService(customerId);
    
    const websitesWithMessages = websites.map((website : any) => {
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
    const parsedId = websiteValidation.websiteIdParamSchema.safeParse(req?.params?.id);
    if (!parsedId.success) {
      res.status(400).json({ error: 'Missing required parameters' }); 
      return;
    }

    const id = parsedId.data;
    const website = await getWebsiteInfoService(id);
    
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
    const parsedId = websiteValidation.websiteIdParamSchema.safeParse(req?.params?.id);
    if (!parsedId.success) {
      res.status(400).json({ error: 'Missing required parameters' });
      return;
    }

    const id = parsedId.data;
    const secret = await generateSecret(id);
    res.json({ secret });
  } catch (error) {
    console.error('Generate secret error:', error);
    res.status(500).json({ error: 'Failed to generate secret' });
  }
}

export const getWidgetConfig = async (req: Request, res: Response) => {
  try {
    const parsedId = websiteValidation.websiteIdParamSchema.safeParse(req?.params?.id);
    if (!parsedId.success) {
      res.status(400).json({ error: 'Missing required parameters' });
      return;
    }

    const id = parsedId.data;
    const website = await getWidgetConfigService(id);
    if (!website) {
      res.status(404).json({ error: 'Website not found' });
      return;
    }
    res.json({
      botName: website.widgetBotName || 'Support Bot',
      primaryColor: website.widgetPrimaryColor || '#6366f1',
      avatarUrl: website.widgetAvatarUrl || null,
      welcomeMessage: website.widgetWelcomeMsg || 'Hi! How can I help you today?',
      position: website.widgetPosition || 'bottom-right',
      apiSecret: website.api_secret,
      websiteId: website.id,
    });
  } catch (error) {
    console.error('Get widget config error:', error);
    res.status(500).json({ error: 'Failed to get widget config' });
  }
};

export const updateWidgetConfig = async (req: Request, res: Response) => {
  try {
    const parsedId = websiteValidation.websiteIdParamSchema.safeParse(req?.params?.id);
    if (!parsedId.success) {
      res.status(400).json({ error: 'Missing required parameters' });
      return;
    }
    
    const id = parsedId.data;
    const parsedWidgetConfig = websiteValidation.widgetConfigSchema.safeParse(req.body);
    if (!parsedWidgetConfig.success) {
      res.status(400).json({ error: parsedWidgetConfig.error.issues[0]?.message || 'Invalid request data' });
      return;
    }
    await updateWidgetConfigService(id, parsedWidgetConfig.data);
    res.json({ success: true });
  } catch (error) {
    console.error('Update widget config error:', error);
    res.status(500).json({ error: 'Failed to update widget config' });
  }
};
