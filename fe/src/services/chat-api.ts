import apiService from "./api";

export interface ChatRequest {
  query: string;
  websiteId: number;
  sessionId?: string;
}

export interface ChatResponse {
  answer: string;
  sources: Array<{ url: string; title: string; relevance: number }>;
  followupQuestions?: string[];
}

export const chatApiService = {
  sendMessage: async (request: ChatRequest): Promise<ChatResponse> => {
    return apiService.post<ChatResponse>('/chat', request);
  },
  
  getWebsiteInfo: async (websiteId: number): Promise<any> => {
    return apiService.get(`/websites/${websiteId}`);
  }
};

export default chatApiService; 