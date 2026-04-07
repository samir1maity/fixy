import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fadeUp } from '@/lib/motion';
import { initials, timeAgo } from '@/lib/utils';
import { LEAD_STATUS_CONFIG, LEAD_NEXT_STATUS } from '@/constants/leads.constants';
import leadsApiService, { Lead, LeadStatus } from '@/services/leads-api';
import { toast } from 'sonner';

// ── StatusBadge ───────────────────────────────────────────────────────────────

export const StatusBadge = ({ status }: { status: LeadStatus }) => {
  const cfg = LEAD_STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.classes}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

// ── LeadRow ───────────────────────────────────────────────────────────────────

interface LeadRowProps {
  lead: Lead;
  index: number;
  websiteId: number;
  showAction: boolean;
  onStatusChange: (id: string, oldStatus: LeadStatus, newStatus: LeadStatus) => void;
  onOpen: (lead: Lead) => void;
}

const LeadRow = ({ lead, index, websiteId, showAction, onStatusChange, onOpen }: LeadRowProps) => {
  const [updating, setUpdating] = useState(false);
  const next = LEAD_NEXT_STATUS[lead.status];

  const handleQuickAdvance = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!next) return;
    setUpdating(true);
    try {
      await leadsApiService.updateLeadStatus(websiteId, lead.id, next);
      onStatusChange(lead.id, lead.status, next);
      toast.success(`Moved to ${LEAD_STATUS_CONFIG[next].label}`, { position: 'top-right', duration: 2000 });
    } catch {
      toast.error('Failed to update status', { position: 'top-right' });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <motion.tr
      variants={fadeUp()}
      custom={index}
      onClick={() => onOpen(lead)}
      className="group border-b border-border/50 last:border-0 hover:bg-muted/30 cursor-pointer transition-colors"
    >
      {/* Name + message preview */}
      <td className="py-3 pl-4 pr-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-xs font-bold text-white select-none">
            {initials(lead.visitorName)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate leading-tight">{lead.visitorName}</p>
            <p className="text-xs text-muted-foreground truncate mt-0.5 max-w-[180px]">{lead.message}</p>
          </div>
        </div>
      </td>

      {/* Email + company */}
      <td className="py-3 px-3 hidden sm:table-cell">
        <p className="text-xs text-foreground truncate">{lead.visitorEmail}</p>
        {lead.visitorCompany && (
          <p className="text-[10px] text-muted-foreground truncate mt-0.5 flex items-center gap-1">
            <Building2 className="h-2.5 w-2.5 shrink-0" />{lead.visitorCompany}
          </p>
        )}
      </td>

      {/* Intent */}
      <td className="py-3 px-3 hidden lg:table-cell">
        {lead.detectedIntent && (
          <span className="inline-flex items-center gap-1 text-[10px] text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40 rounded-full px-2 py-1 font-medium whitespace-nowrap">
            <Sparkles className="h-2.5 w-2.5 shrink-0" />
            {lead.detectedIntent}
          </span>
        )}
      </td>

      {/* Status */}
      <td className="py-3 px-3">
        <StatusBadge status={lead.status} />
      </td>

      {/* Time */}
      <td className="py-3 px-3 hidden md:table-cell">
        <span className="text-xs text-muted-foreground whitespace-nowrap">{timeAgo(lead.createdAt)}</span>
      </td>

      {/* Quick-advance action */}
      {showAction && (
        <td className="py-3 pl-3 pr-4 text-right">
          {next && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleQuickAdvance}
              disabled={updating}
              className="h-7 text-xs px-2.5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
            >
              {updating ? '…' : `→ ${LEAD_STATUS_CONFIG[next].label}`}
            </Button>
          )}
        </td>
      )}
    </motion.tr>
  );
};

export default LeadRow;
