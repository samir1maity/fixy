import { LeadStatus } from '../constants/lead.constants.js';

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
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedLeads {
  leads: Lead[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
