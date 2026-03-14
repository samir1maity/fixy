import { z } from 'zod';
import { LEAD_STATUSES } from '../constants/lead.constants.js';

export const createLeadSchema = z.object({
  visitorName: z.string().trim().min(1, 'Name is required').max(100),
  visitorEmail: z.string().trim().email('Invalid email address'),
  visitorPhone: z.string().trim().max(20).optional(),
  visitorCompany: z.string().trim().max(100).optional(),
  message: z.string().trim().min(1, 'Message is required').max(1000),
  conversationSnippet: z.string().trim().max(3000).optional(),
  sourcePage: z.string().trim().url().optional(),
  detectedIntent: z.string().trim().min(1).max(50),
});

export const updateLeadStatusSchema = z.object({
  status: z.enum([
    LEAD_STATUSES.NEW,
    LEAD_STATUSES.CONTACTED,
    LEAD_STATUSES.QUALIFIED,
    LEAD_STATUSES.CLOSED,
  ]),
});

export const getLeadsQuerySchema = z.object({
  status: z
    .enum([LEAD_STATUSES.NEW, LEAD_STATUSES.CONTACTED, LEAD_STATUSES.QUALIFIED, LEAD_STATUSES.CLOSED])
    .optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadStatusInput = z.infer<typeof updateLeadStatusSchema>;
export type GetLeadsQuery = z.infer<typeof getLeadsQuerySchema>;
