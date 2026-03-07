import { Request, Response } from "express";
import * as analyticsService from "../services/analytics.service.js";
import { assertWebsiteOwner } from "../services/website.service.js";

export const getUserChatStats = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
         res.status(401).json({ error: 'Authentication required' });
         return;
      }
      const data = await analyticsService.getUserChatStats(req.user.userId);
      res.status(200).json(data);
    } catch (error) {
      console.error('Get chat stats error:', error);
      res.status(500).json({ error: 'Failed to retrieve chat stats' });
    }
};

export const getWebsiteChatStats = async (req: Request, res: Response) => {
    try {
        const websiteId = Number(req.params.websiteId);
        await assertWebsiteOwner(websiteId, req.user!.userId);
        const stats = await analyticsService.getWebsiteChatStats(websiteId);
        res.status(200).json(stats);
    } catch (error) {
        const status = (error as any)?.status;
        if (status === 403 || status === 404) {
            res.status(status).json({ error: (error as Error).message });
            return;
        }
        console.error('Get website chat stats error:', error);
        res.status(500).json({ error: 'Failed to retrieve website chat stats' });
    }
};