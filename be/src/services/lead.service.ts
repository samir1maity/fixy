import nodemailer from 'nodemailer';
import { prisma } from '../configs/db.js';
import config from '../configs/config.js';
import { LEAD_STATUSES } from '../constants/lead.constants.js';
import type { CreateLeadInput, UpdateLeadStatusInput, GetLeadsQuery } from '../zod/lead.js';
import type { Lead, PaginatedLeads } from '../types/lead.js';

export async function createLead(websiteId: number, data: CreateLeadInput): Promise<Lead> {
  const lead = await prisma.lead.create({
    data: {
      websiteId,
      visitorName: data.visitorName,
      visitorEmail: data.visitorEmail,
      visitorPhone: data.visitorPhone ?? null,
      visitorCompany: data.visitorCompany ?? null,
      message: data.message,
      conversationSnippet: data.conversationSnippet ?? null,
      sourcePage: data.sourcePage ?? null,
      detectedIntent: data.detectedIntent,
      status: LEAD_STATUSES.NEW,
    },
  });

  sendLeadNotificationEmail(websiteId, lead as Lead).catch((err) => {
    console.error('[Lead] Failed to send notification email:', err);
  });

  return lead as Lead;
}

export async function getLeads(
  websiteId: number,
  query: GetLeadsQuery
): Promise<PaginatedLeads> {
  const { status, page, limit } = query;
  const skip = (page - 1) * limit;

  const where = {
    websiteId,
    ...(status ? { status } : {}),
  };

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.lead.count({ where }),
  ]);

  return {
    leads: leads as Lead[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function updateLeadStatus(
  leadId: string,
  websiteId: number,
  data: UpdateLeadStatusInput
): Promise<Lead> {
  const lead = await prisma.lead.findFirst({
    where: { id: leadId, websiteId },
  });

  if (!lead) {
    throw new Error('Lead not found');
  }

  const updated = await prisma.lead.update({
    where: { id: leadId },
    data: { status: data.status },
  });

  return updated as Lead;
}

async function sendLeadNotificationEmail(websiteId: number, lead: Lead): Promise<void> {
  if (!config.email.host || !config.email.user) {
    return; 
  }

  const website = await prisma.website.findUnique({
    where: { id: websiteId },
    include: { customer: { select: { email: true, name: true } } },
  });

  if (!website?.customer?.email) return;

  const transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    auth: {
      user: config.email.user,
      pass: config.email.password,
    },
  });

  const snippetHtml = lead.conversationSnippet
    ? `<h3>Conversation Snippet</h3><pre style="background:#f3f4f6;padding:12px;border-radius:6px;font-size:13px;white-space:pre-wrap;">${escapeHtml(lead.conversationSnippet)}</pre>`
    : '';

  const sourceHtml = lead.sourcePage
    ? `<p><strong>Source Page:</strong> <a href="${lead.sourcePage}">${lead.sourcePage}</a></p>`
    : '';

  await transporter.sendMail({
    from: config.email.from,
    to: website.customer.email,
    subject: `New Lead from ${website.name || website.domain} — ${lead.visitorName}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#6366f1;">New Lead Captured 🎉</h2>
        <p>A new lead was captured from your chatbot on <strong>${website.name || website.domain}</strong>.</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;"/>
        <h3>Contact Details</h3>
        <p><strong>Name:</strong> ${escapeHtml(lead.visitorName)}</p>
        <p><strong>Email:</strong> <a href="mailto:${lead.visitorEmail}">${lead.visitorEmail}</a></p>
        ${lead.visitorPhone ? `<p><strong>Phone:</strong> ${escapeHtml(lead.visitorPhone)}</p>` : ''}
        ${lead.visitorCompany ? `<p><strong>Company:</strong> ${escapeHtml(lead.visitorCompany)}</p>` : ''}
        <h3>Their Message</h3>
        <p style="background:#f3f4f6;padding:12px;border-radius:6px;">${escapeHtml(lead.message)}</p>
        <p><strong>Detected Intent:</strong> ${escapeHtml(lead.detectedIntent)}</p>
        ${sourceHtml}
        ${snippetHtml}
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;"/>
        <p style="color:#6b7280;font-size:13px;">Powered by <a href="https://fixy.iamsamir.space">Fixy</a></p>
      </div>
    `,
  });
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
