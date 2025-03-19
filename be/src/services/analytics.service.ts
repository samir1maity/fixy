import { prisma } from "../configs/db.js";
import { getWebsitesService } from "./website.service.js";

export interface Website {
  id: number;
  name: string;
  domain: string;
  status: 'pending' | 'embedding' | 'completed' | 'failed';
  chatbotActive: boolean;
  requestsToday: number;
  requestsTotal: number;
  lastChecked: string;
  api_secret: string;
}

export async function getUserChatStats(userId: string) {
  //@ts-ignore
  const websites: Website[] = await getWebsitesService(userId);
  const websiteIds = websites.map((website: Website) => website.id);

  if (websiteIds.length === 0) {
    return {
      totalChats: 0,
      todayChats: 0,
      activeWebsites: 0,
      totalWebsites: 0,
    };
  }

  const totalChats = await prisma.chatInteraction.count({
    where: {
      websiteId: {
        in: websiteIds,
      },
    },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayChats = await prisma.chatInteraction.count({
    where: {
      websiteId: {
        in: websiteIds,
      },
      createdAt: {
        gte: today,
      },
    },
  });

  const activeWebsites = websites.filter(
    (website: Website) => website.status === "completed"
  ).length;

  return {
    totalChats,
    todayChats,
    activeWebsites,
    totalWebsites: websites.length,
  };
}

export async function getWebsiteChatStats(websiteId: number) {
  const totalChats = await prisma.chatInteraction.count({
    where: {
      websiteId,
    },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayChats = await prisma.chatInteraction.count({
    where: {
      websiteId,
      createdAt: {
        gte: today,
      },
    },
  });

  return {
    totalChats,
    todayChats,
  };
}
