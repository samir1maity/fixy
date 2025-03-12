import apiService from "./api";

export interface Website {
  id: number;
  name: string;
  url: string;
  status: 'healthy' | 'issues' | 'pending';
  chatbotActive: boolean;
  requestsToday: number;
  requestsTotal: number;
  lastChecked: string;
}

export const websiteApiService = {
    registerWebsite: async (url: string): Promise<Website> => {
        return apiService.post<Website>('/websites', { url });
    },
    getWebsites: async (): Promise<Website[]> => {
        return apiService.get<Website[]>('/api/websites');
    }
}

  export default websiteApiService; 