import apiService from './api';

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'closed';

export interface Lead {
  id: string;
  websiteId: number;
  visitorName: string;
  visitorEmail: string;
  visitorPhone: string | null;
  visitorCompany: string | null;
  message: string;
  conversationSnippet: string | null;
  sourcePage: string | null;
  detectedIntent: string;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedLeads {
  leads: Lead[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetLeadsParams {
  status?: LeadStatus;
  page?: number;
  limit?: number;
}

const leadsApiService = {
  getLeads: (websiteId: number, params: GetLeadsParams = {}): Promise<PaginatedLeads> => {
    const query = new URLSearchParams();
    if (params.status) query.set('status', params.status);
    if (params.page !== undefined) query.set('page', String(params.page));
    if (params.limit !== undefined) query.set('limit', String(params.limit));
    const qs = query.toString();
    return apiService.get<PaginatedLeads>(`/websites/${websiteId}/leads${qs ? `?${qs}` : ''}`);
  },

  updateLeadStatus: (websiteId: number, leadId: string, status: LeadStatus): Promise<{ lead: Lead }> =>
    apiService.patch<{ lead: Lead }>(`/websites/${websiteId}/leads/${leadId}/status`, { status }),
};

export default leadsApiService;
