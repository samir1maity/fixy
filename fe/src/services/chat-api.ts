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
  sessionId?: string;
}

export const chatApiService = {
  sendMessage: async (request: ChatRequest, apiSecret?: string): Promise<ChatResponse> => {
    const headers = apiSecret ? { 'x-api-secret': apiSecret } : undefined;
    return apiService.post<ChatResponse>('/chat', request, { headers });
  },
};

export default chatApiService; 