import apiService from "./api";
import { AddWebsiteFormData } from "@/components/dashboard/add-website-modal";

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

export interface WidgetConfig {
  widgetPrimaryColor?: string;
  widgetBotName?: string;
  widgetAvatarUrl?: string;
  widgetWelcomeMsg?: string;
  widgetPosition?: string;
}

export const websiteApiService = {
    registerWebsite: async (formData: AddWebsiteFormData): Promise<{ id: number; api_secret: string }> => {
        const body = new FormData();
        body.append('name', formData.name);
        if (formData.url) body.append('url', formData.url);
        if (formData.textContent) body.append('textContent', formData.textContent);
        if (formData.file) body.append('file', formData.file);

        return apiService.post<{ id: number; api_secret: string }>('/websites', body, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
    getWebsites: async (): Promise<Website[]> => {
        console.log('code reached to getWebsites');
        return apiService.get<Website[]>('/websites');
    },
    getWebsiteInfo: async (websiteId: number): Promise<any> => {
        return apiService.get(`/websites/${websiteId}`);
    },
    updateWidgetConfig: async (websiteId: number, config: WidgetConfig): Promise<void> => {
        return apiService.patch(`/websites/${websiteId}/widget-config`, config);
    },
}

export default websiteApiService;
