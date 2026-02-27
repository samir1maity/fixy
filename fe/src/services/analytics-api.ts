import apiService from "./api";

export interface UserChatStats {
  totalChats: number;
  todayChats: number;
  activeWebsites: number;
  totalWebsites: number;
}

export interface DailyRequestStat {
  date: string;
  requests: number;
}

export interface HourlyRequestStat {
  hour: string;
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
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface WebsiteAnalytics {
  websiteId: number;
  domain: string;
  requestsToday: number;
  requestsTotal: number;
  requestsThisWeek: number;
  requestsThisMonth: number;
  avgResponseTime: number;
  dailyStats: DailyRequestStat[];
  hourlyStats: HourlyRequestStat[];
  recentSessions: ChatSession[];
}

export const analyticsApiService = {
    getUserChatStats: async (): Promise<UserChatStats> => {
        return apiService.get<UserChatStats>('/analytics/user-chat-stats');
    },
    getWebsiteAnalytics: async (websiteId: number): Promise<WebsiteAnalytics> => {
        return apiService.get<WebsiteAnalytics>(`/analytics/website/${websiteId}`);
    },
    getSessionMessages: async (sessionId: string): Promise<ChatMessage[]> => {
        return apiService.get<ChatMessage[]>(`/analytics/session/${sessionId}/messages`);
    },
}

export default analyticsApiService;