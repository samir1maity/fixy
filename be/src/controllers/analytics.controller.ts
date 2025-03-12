import { NextFunction, Request, Response } from "express";
import * as analyticsService from "../services/analytics.service.js";

export const getUserChatStats = async (req: Request, res: Response, next: NextFunction) => {
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

export const getWebsiteChatStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { websiteId } = req.params;
        const stats = await analyticsService.getWebsiteChatStats(Number(websiteId));
        res.status(200).json(stats);
    } catch (error) {
        console.error('Get website chat stats error:', error);
        res.status(500).json({ error: 'Failed to retrieve website chat stats' });
    }
};