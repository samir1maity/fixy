import { prisma } from "../configs/db.js";
import { getWebsitesService } from "./website.service.js";
import {
  startOfTodayInTz,
  daysAgoInTz,
  aggregateDailyStats,
  aggregateHourlyStats,
  aggregateSessions,
} from "../helpers/analytics.helper.js";

interface WebsiteRow {
  id: number;
  status: string;
  [key: string]: unknown;
}

export async function getUserChatStats(userId: string, tz: string) {
  const websites = (await getWebsitesService(userId)) as WebsiteRow[];
  const websiteIds = websites.map((w) => w.id);

  if (websiteIds.length === 0) {
    return { totalChats: 0, todayChats: 0, activeWebsites: 0, totalWebsites: 0 };
  }

  const today = startOfTodayInTz(tz);

  const [totalChats, todayChats] = await Promise.all([
    prisma.chatInteraction.count({ where: { websiteId: { in: websiteIds } } }),
    prisma.chatInteraction.count({
      where: { websiteId: { in: websiteIds }, createdAt: { gte: today } },
    }),
  ]);

  return {
    totalChats,
    todayChats,
    activeWebsites: websites.filter((w) => w.status === "completed").length,
    totalWebsites: websites.length,
  };
}

export async function getWebsiteAnalytics(websiteId: number, tz: string) {
  const today = startOfTodayInTz(tz);
  const thirtyDaysAgo = daysAgoInTz(30, tz);
  const sevenDaysAgo = daysAgoInTz(7, tz);

  const [
    website,
    totalChats,
    todayChats,
    weekChats,
    monthChats,
    rawDaily,
    rawHourly,
    rawSessions,
  ] = await Promise.all([
    prisma.website.findUnique({
      where: { id: websiteId },
      select: { id: true, domain: true, name: true },
    }),
    prisma.chatInteraction.count({ where: { websiteId } }),
    prisma.chatInteraction.count({ where: { websiteId, createdAt: { gte: today } } }),
    prisma.chatInteraction.count({ where: { websiteId, createdAt: { gte: sevenDaysAgo } } }),
    prisma.chatInteraction.count({ where: { websiteId, createdAt: { gte: thirtyDaysAgo } } }),
    prisma.chatInteraction.findMany({
      where: { websiteId, createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.chatInteraction.findMany({
      where: { websiteId, createdAt: { gte: today } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.chatInteraction.findMany({
      where: { websiteId, sessionId: { not: null } },
      select: { sessionId: true, query: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
  ]);

  return {
    websiteId,
    domain: website?.domain ?? "",
    name: website?.name ?? website?.domain ?? "",
    timezone: tz,
    totalChats,
    todayChats,
    weekChats,
    monthChats,
    dailyStats: aggregateDailyStats(rawDaily, 30, tz),
    hourlyStats: aggregateHourlyStats(rawHourly, tz),
    recentSessions: aggregateSessions(rawSessions, 10),
  };
}

export async function getSessionMessages(sessionId: string) {
  const interactions = await prisma.chatInteraction.findMany({
    where: { sessionId },
    select: { id: true, query: true, response: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  return interactions.flatMap((i) => [
    { id: `${i.id}-u`, role: "user" as const, content: i.query, timestamp: i.createdAt },
    { id: `${i.id}-a`, role: "assistant" as const, content: i.response, timestamp: i.createdAt },
  ]);
}
