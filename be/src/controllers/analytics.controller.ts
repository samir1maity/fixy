import { Request, Response } from "express";
import * as analyticsService from "../services/analytics.service.js";
import { assertWebsiteOwner } from "../services/website.service.js";
import { resolveTimezone } from "../helpers/analytics.helper.js";

export const getUserChatStats = async (req: Request, res: Response) => {
  try {
    const tz = resolveTimezone(req.headers["x-timezone"] as string);
    const data = await analyticsService.getUserChatStats(req.user!.userId, tz);
    res.json(data);
  } catch (error) {
    console.error("getUserChatStats error:", error);
    res.status(500).json({ error: "Failed to retrieve chat stats" });
  }
};

export const getWebsiteAnalytics = async (req: Request, res: Response) => {
  try {
    const websiteId = Number(req.params.websiteId);
    await assertWebsiteOwner(websiteId, req.user!.userId);
    const tz = resolveTimezone(req.headers["x-timezone"] as string);
    const data = await analyticsService.getWebsiteAnalytics(websiteId, tz);
    res.json(data);
  } catch (error) {
    const status = (error as any)?.status;
    if (status === 403 || status === 404) {
      res.status(status).json({ error: (error as Error).message });
      return;
    }
    console.error("getWebsiteAnalytics error:", error);
    res.status(500).json({ error: "Failed to retrieve website analytics" });
  }
};

export const getSessionMessages = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const messages = await analyticsService.getSessionMessages(sessionId);
    res.json(messages);
  } catch (error) {
    console.error("getSessionMessages error:", error);
    res.status(500).json({ error: "Failed to retrieve session messages" });
  }
};
