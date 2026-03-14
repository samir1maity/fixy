import { Request, Response } from 'express';
import * as leadService from '../services/lead.service.js';
import { createLeadSchema, updateLeadStatusSchema, getLeadsQuerySchema } from '../zod/lead.js';
import { websiteIdParamSchema } from '../zod/website.js';
import { assertWebsiteOwner } from '../services/website.service.js';

export const submitLead = async (req: Request, res: Response): Promise<void> => {
  try {
    const websiteId = req.website?.websiteId;

    if (!websiteId) {
      res.status(400).json({ error: 'Missing website context' });
      return;
    }

    const parsed = createLeadSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message });
      return;
    }

    const lead = await leadService.createLead(websiteId, parsed.data);
    res.status(201).json({ lead });
  } catch (error) {
    console.error('[Lead] submitLead error:', error);
    res.status(500).json({ error: 'Failed to save lead' });
  }
};

export const getLeads = async (req: Request, res: Response): Promise<void> => {
  try {
    const websiteId = websiteIdParamSchema.safeParse(req.params.websiteId);
    if (!websiteId.success) {
      res.status(400).json({ error: 'Invalid website ID' });
      return;
    }

    await assertWebsiteOwner(websiteId.data, req.user!.userId);

    const query = getLeadsQuerySchema.safeParse(req.query);
    if (!query.success) {
      res.status(400).json({ error: query.error.errors[0].message });
      return;
    }

    const result = await leadService.getLeads(websiteId.data, query.data);
    res.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === 'Forbidden') {
      res.status(403).json({ error: 'Access denied' });
      return;
    }
    console.error('[Lead] getLeads error:', error);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
};

export const updateLeadStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const websiteId = websiteIdParamSchema.safeParse(req.params.websiteId);
    if (!websiteId.success) {
      res.status(400).json({ error: 'Invalid website ID' });
      return;
    }

    await assertWebsiteOwner(websiteId.data, req.user!.userId);

    const { leadId } = req.params;
    if (!leadId) {
      res.status(400).json({ error: 'Missing lead ID' });
      return;
    }

    const parsed = updateLeadStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message });
      return;
    }

    const lead = await leadService.updateLeadStatus(leadId, websiteId.data, parsed.data);
    res.json({ lead });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Forbidden') {
        res.status(403).json({ error: 'Access denied' });
        return;
      }
      if (error.message === 'Lead not found') {
        res.status(404).json({ error: 'Lead not found' });
        return;
      }
    }
    console.error('[Lead] updateLeadStatus error:', error);
    res.status(500).json({ error: 'Failed to update lead status' });
  }
};
