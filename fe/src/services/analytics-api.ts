import apiService from "./api";

export interface UserChatStats {
  totalChats: number;
  todayChats: number;
  activeWebsites: number;
  totalWebsites: number;
}

export const analyticsApiService = {
    getUserChatStats: async (): Promise<UserChatStats> => {
        return apiService.get<UserChatStats>('/analytics/user-chat-stats');
    },
}

export default analyticsApiService; 