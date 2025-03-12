import { prisma } from "../configs/db.js";
import { getWebsitesService } from "./website.service.js";

export async function getUserChatStats(userId: string) {
  const websites = await getWebsitesService(userId);
  const websiteIds = websites.map((website) => website.id);

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
    (website) => website.status === "completed"
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
