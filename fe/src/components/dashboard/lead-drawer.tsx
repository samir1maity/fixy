import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, Building2, Globe, ExternalLink, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { initials } from '@/lib/utils';
import { LEAD_STATUS_CONFIG, LEAD_NEXT_STATUS } from '@/constants/leads.constants';
import { StatusBadge } from '@/components/dashboard/lead-row';
import leadsApiService, { Lead, LeadStatus } from '@/services/leads-api';
import { toast } from 'sonner';

interface LeadDrawerProps {
  lead: Lead;
  websiteId: number;
  onClose: () => void;
  onStatusChange: (id: string, oldStatus: LeadStatus, newStatus: LeadStatus) => void;
}

const LeadDrawer = ({ lead, websiteId, onClose, onStatusChange }: LeadDrawerProps) => {
  const [updating, setUpdating] = useState(false);
  const next = LEAD_NEXT_STATUS[lead.status];

  const handleAdvance = async () => {
    if (!next) return;
    setUpdating(true);
    try {
      await leadsApiService.updateLeadStatus(websiteId, lead.id, next);
      onStatusChange(lead.id, lead.status, next);
      toast.success(`Lead moved to ${LEAD_STATUS_CONFIG[next].label}`, { position: 'top-right', duration: 2500 });
    } catch {
      toast.error('Failed to update status', { position: 'top-right' });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.aside
        key="drawer"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-10 w-full max-w-md bg-background border-l flex flex-col h-full shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-sm font-bold text-white select-none">
              {initials(lead.visitorName)}
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight">{lead.visitorName}</p>
              <p className="text-xs text-muted-foreground">{lead.visitorEmail}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-accent"
          >
            Close
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Status + advance */}
          <div className="flex items-center justify-between gap-3">
            <StatusBadge status={lead.status} />
            {next ? (
              <Button size="sm" variant="outline" onClick={handleAdvance} disabled={updating} className="h-7 text-xs gap-1.5">
                {updating ? 'Updating…' : `Move to ${LEAD_STATUS_CONFIG[next].label}`}
              </Button>
            ) : (
              <span className="text-xs text-muted-foreground italic">Pipeline complete</span>
            )}
          </div>

          {/* Contact info */}
          <div className="bg-muted/40 rounded-xl p-4 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact</p>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5 text-sm">
                <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <a href={`mailto:${lead.visitorEmail}`} className="hover:underline truncate">{lead.visitorEmail}</a>
              </div>
              {lead.visitorPhone && (
                <div className="flex items-center gap-2.5 text-sm">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span>{lead.visitorPhone}</span>
                </div>
              )}
              {lead.visitorCompany && (
                <div className="flex items-center gap-2.5 text-sm">
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span>{lead.visitorCompany}</span>
                </div>
              )}
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Message</p>
            <p className="text-sm leading-relaxed bg-muted/40 rounded-xl p-4">{lead.message}</p>
          </div>

          {/* Intent */}
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-violet-500 shrink-0" />
            <p className="text-xs text-muted-foreground">
              Detected intent: <span className="font-medium text-foreground">{lead.detectedIntent}</span>
            </p>
          </div>

          {/* Conversation snippet */}
          {lead.conversationSnippet && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Conversation snippet</p>
              <pre className="text-xs leading-relaxed bg-muted/40 rounded-xl p-4 whitespace-pre-wrap font-sans">
                {lead.conversationSnippet}
              </pre>
            </div>
          )}

          {/* Source page */}
          {lead.sourcePage && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Globe className="h-3.5 w-3.5 shrink-0" />
              <a
                href={lead.sourcePage}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate hover:underline hover:text-foreground transition-colors flex items-center gap-1"
              >
                {lead.sourcePage}
                <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t px-5 py-3">
          <p className="text-xs text-muted-foreground text-center">
            Submitted {new Date(lead.createdAt).toLocaleString()}
          </p>
        </div>
      </motion.aside>
    </div>
  );
};

export default LeadDrawer;
