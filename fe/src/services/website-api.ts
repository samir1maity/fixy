import apiService from "./api";

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

export const websiteApiService = {
    registerWebsite: async (url: string): Promise<Website> => {
        return apiService.post<Website>('/websites', { url });
    },
    getWebsites: async (): Promise<Website[]> => {
        console.log('code reached to getWebsites');
        return apiService.get<Website[]>('/websites');
    },
    getWebsiteInfo: async (websiteId: number): Promise<any> => {
        return apiService.get(`/websites/${websiteId}`);
    },
}

export default websiteApiService; 