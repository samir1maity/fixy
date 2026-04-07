import type { LeadStatus } from '@/services/leads-api';

export const LEAD_FILTER_STATUSES: { value: LeadStatus | 'all'; label: string }[] = [
  { value: 'all',       label: 'All' },
  { value: 'new',       label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'closed',    label: 'Closed' },
];

export const LEAD_STATUS_CONFIG: Record<LeadStatus, { label: string; classes: string; dot: string }> = {
  new:       { label: 'New',       classes: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',    dot: 'bg-violet-500' },
  contacted: { label: 'Contacted', classes: 'bg-blue-100   text-blue-700   dark:bg-blue-900/30   dark:text-blue-400',      dot: 'bg-blue-500'   },
  qualified: { label: 'Qualified', classes: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', dot: 'bg-emerald-500' },
  closed:    { label: 'Closed',    classes: 'bg-slate-100  text-slate-600   dark:bg-slate-800     dark:text-slate-400',     dot: 'bg-slate-400'  },
};

export const LEAD_NEXT_STATUS: Record<LeadStatus, LeadStatus | null> = {
  new:       'contacted',
  contacted: 'qualified',
  qualified: 'closed',
  closed:    null,
};

export const LEADS_PAGE_LIMIT = 15;
