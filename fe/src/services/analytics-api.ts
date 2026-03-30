import apiService from "./api";

export interface UserChatStats {
  totalChats: number;
  todayChats: number;
  activeWebsites: number;
  totalWebsites: number;
}

export interface DailyStat {
  date: string;      // "YYYY-MM-DD"
  requests: number;
}

export interface HourlyStat {
  hour: string;      // "HH:00"
  requests: number;
}

export interface ChatSession {
  sessionId: string;
  startedAt: string;
  messageCount: number;
  lastMessage: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface WebsiteAnalytics {
  websiteId: number;
  domain: string;
  name: string;
  totalChats: number;
  todayChats: number;
  weekChats: number;
  monthChats: number;
  dailyStats: DailyStat[];
  hourlyStats: HourlyStat[];
  recentSessions: ChatSession[];
}

const browserTz = () => Intl.DateTimeFormat().resolvedOptions().timeZone;
const tzHeader = (tz?: string) => ({ "x-timezone": tz ?? browserTz() });

const analyticsApiService = {
  getUserChatStats: (tz?: string): Promise<UserChatStats> =>
    apiService.get("/analytics/user-chat-stats", { headers: tzHeader(tz) }),

  getWebsiteAnalytics: (websiteId: number, tz?: string): Promise<WebsiteAnalytics> =>
    apiService.get(`/analytics/website/${websiteId}`, { headers: tzHeader(tz) }),

  getSessionMessages: (sessionId: string): Promise<ChatMessage[]> =>
    apiService.get(`/analytics/session/${sessionId}/messages`),
};

export default analyticsApiService;