import { Request, Response } from 'express';
import { assertWebsiteOwner, generateSecret, getWebsiteInfoService, getWebsitesService, getWidgetConfigService, isPdfEnabled, registerWebsite as registerWebsiteService, updateKnowledgeService, updateWidgetConfigService } from '../services/website.service.js';
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

    if (file && file.mimetype === 'application/pdf') {
      res.status(403).json({ error: 'PDF uploads are currently disabled. Please use a URL or paste text.' });
      return;
    }

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
    
    const pdfEnabled = isPdfEnabled();
    const websitesWithMessages = websites.map((website : any) => ({
      ...website,
      pdfEnabled,
      ...(website.status === 'failed' && { statusMessage: "Processing failed. Please try a different website or contact support." }),
    }));

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
    await assertWebsiteOwner(id, req.user!.userId);
    const website = await getWebsiteInfoService(id);

    if (website && website.status === 'failed' && !website.statusMessage) {
      website.statusMessage = "Processing failed. Please try a different website or contact support.";
    }

    res.json({ ...website, pdfEnabled: isPdfEnabled() });
  } catch (error) {
    const status = (error as any)?.status;
    if (status === 403 || status === 404) {
      res.status(status).json({ error: (error as Error).message });
      return;
    }
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
    await assertWebsiteOwner(id, req.user!.userId);
    const secret = await generateSecret(id);
    res.json({ secret });
  } catch (error) {
    const status = (error as any)?.status;
    if (status === 403 || status === 404) {
      res.status(status).json({ error: (error as Error).message });
      return;
    }
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
    await assertWebsiteOwner(id, req.user!.userId);
    const parsedWidgetConfig = websiteValidation.widgetConfigSchema.safeParse(req.body);
    if (!parsedWidgetConfig.success) {
      res.status(400).json({ error: parsedWidgetConfig.error.issues[0]?.message || 'Invalid request data' });
      return;
    }
    await updateWidgetConfigService(id, parsedWidgetConfig.data);
    res.json({ success: true });
  } catch (error) {
    const status = (error as any)?.status;
    if (status === 403 || status === 404) {
      res.status(status).json({ error: (error as Error).message });
      return;
    }
    console.error('Update widget config error:', error);
    res.status(500).json({ error: 'Failed to update widget config' });
  }
};

export const getPdfStatus = (_req: Request, res: Response) => {
  res.json({ pdfEnabled: isPdfEnabled() });
};

export const updateKnowledge = async (req: Request, res: Response) => {
  try {
    const parsedId = websiteValidation.websiteIdParamSchema.safeParse(req?.params?.id);
    if (!parsedId.success) {
      res.status(400).json({ error: 'Missing required parameters' });
      return;
    }

    await assertWebsiteOwner(parsedId.data, req.user!.userId);

    const mode = req.body.mode as string;
    if (mode !== 'reset' && mode !== 'append') {
      res.status(400).json({ error: 'mode must be "reset" or "append"' });
      return;
    }

    const file = (req as any).file as Express.Multer.File | undefined;
    const textContent = req.body.textContent as string | undefined;

    if (file && file.mimetype === 'application/pdf' && !isPdfEnabled()) {
      res.status(403).json({ error: 'PDF uploads are currently disabled. Please use text content instead.' });
      return;
    }

    if (!file && !textContent?.trim()) {
      res.status(400).json({ error: 'Provide a file or text content' });
      return;
    }

    await updateKnowledgeService(parsedId.data, mode, {
      fileBuffer: file?.buffer,
      fileName: file?.originalname,
      textContent,
    });

    res.json({ status: 'pending', message: 'Knowledge update started.' });
  } catch (error) {
    const status = (error as any)?.status;
    if (status === 403 || status === 404) {
      res.status(status).json({ error: (error as Error).message });
      return;
    }
    console.error('Update knowledge error:', error);
    const msg = error instanceof Error ? error.message : 'Failed to update knowledge';
    res.status(400).json({ error: msg });
  }
};
