import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, RefreshCw, MessageSquare, Globe, AlertTriangle, BarChart2, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import UpdateKnowledgeModal from './update-knowledge-modal';

interface WebsiteCardProps {
  website: {
    id: number;
    name: string;
    domain: string;
    status: 'completed' | 'failed' | 'pending' | 'embedding';
    chatbotActive: boolean;
    requestsToday: number;
    requestsTotal: number;
    api_secret: string;
    statusMessage?: string;
    pdfEnabled?: boolean;
  };
  isPending?: boolean;
  isPolling?: boolean;
  onKnowledgeUpdated?: () => void;
}

const STATUS_CONFIG = {
  completed: {
    badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20',
    dot: 'bg-emerald-500',
    ping: false,
    label: 'Active',
    topLine: 'via-emerald-500/50',
  },
  pending: {
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20',
    dot: 'bg-amber-500',
    ping: true,
    label: 'Processing',
    topLine: 'via-amber-500/50',
  },
  embedding: {
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20',
    dot: 'bg-amber-500',
    ping: true,
    label: 'Embedding',
    topLine: 'via-amber-500/50',
  },
  failed: {
    badge: 'bg-red-500/10 text-red-600 dark:text-red-400 ring-1 ring-red-500/20',
    dot: 'bg-red-500',
    ping: false,
    label: 'Failed',
    topLine: 'via-red-500/50',
  },
} as const;

const WebsiteCard = ({ website, isPending = false, onKnowledgeUpdated }: WebsiteCardProps) => {
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const cfg = STATUS_CONFIG[website.status];
  const isProcessing = isPending || website.status === 'pending' || website.status === 'embedding';
  const canUpdateKnowledge = website.status === 'completed' || website.status === 'failed';

  return (
    <TooltipProvider delayDuration={150}>
      <>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -3, transition: { duration: 0.15, ease: 'easeOut' } }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm hover:shadow-lg hover:shadow-black/8 dark:hover:shadow-black/25 transition-all duration-300"
        >
          {/* Status accent line */}
          <div className={`absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent ${cfg.topLine} to-transparent`} />

          {/* ── Body ── */}
          <div className="relative flex flex-col p-5 gap-3">

            {/* Header: globe + name + domain */}
            <div className="flex items-center gap-3">
              <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/8 text-primary ring-1 ring-primary/15">
                <Globe className="h-[18px] w-[18px]" />
              </div>
              <div className="min-w-0 text-left">
                <h3 className="truncate text-sm font-semibold text-card-foreground leading-snug" title={website.name}>
                  {website.name}
                </h3>
                {/* <p className="truncate text-[11px] font-mono text-muted-foreground/55 mt-0.5" title={website.domain}>
                  {website.domain}
                </p> */}
              </div>
            </div>

            {/* Status pill */}
            <div>
              <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${cfg.badge}`}>
                {cfg.ping ? (
                  <span className="relative flex h-1.5 w-1.5">
                    <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${cfg.dot} opacity-50`} />
                    <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                  </span>
                ) : (
                  <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                )}
                {isProcessing ? 'Processing' : cfg.label}
                {isProcessing && <Loader2 className="h-2.5 w-2.5 animate-spin" />}
              </div>
            </div>

            {/* Error banner */}
            {website.status === 'failed' && website.statusMessage && (
              <div className="flex gap-2.5 rounded-xl bg-red-500/8 p-3 ring-1 ring-red-500/15">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-red-500 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-red-500 mb-0.5">Processing Failed</p>
                  <p className="text-xs text-red-500/60 leading-relaxed">{website.statusMessage}</p>
                </div>
              </div>
            )}

            {/* Processing notice */}
            {isProcessing && (
              <div className="flex items-center gap-2.5 rounded-xl bg-amber-500/8 p-3 ring-1 ring-amber-500/15">
                <Loader2 className="h-3.5 w-3.5 shrink-0 text-amber-500 animate-spin" />
                <p className="text-xs text-amber-600/70 dark:text-amber-400/60">Scraping & embedding your knowledge base…</p>
              </div>
            )}
          </div>

          {/* ── Bottom action bar ── */}
          <div className="grid grid-cols-4 border-t border-border/40 divide-x divide-border/40">

            {/* Test Chatbot */}
            <Tooltip>
              <TooltipTrigger asChild>
                {website.status === 'completed' ? (
                  <Link to={`/chat/${website.id}`} className="flex flex-col items-center justify-center gap-1 py-3 text-muted-foreground hover:bg-primary/8 hover:text-primary active:scale-95 transition-all duration-150">
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-[10px] font-medium">Chat</span>
                  </Link>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-1 py-3 text-muted-foreground/30 cursor-not-allowed">
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-[10px] font-medium">Chat</span>
                  </div>
                )}
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={6}>Test Chatbot</TooltipContent>
            </Tooltip>

            {/* Update KB */}
            <Tooltip>
              <TooltipTrigger asChild>
                {canUpdateKnowledge ? (
                  <button
                    onClick={() => setIsUpdateModalOpen(true)}
                    className="flex flex-col items-center justify-center gap-1 py-3 text-muted-foreground hover:bg-primary/8 hover:text-primary active:scale-95 transition-all duration-150 w-full"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span className="text-[10px] font-medium">Update</span>
                  </button>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-1 py-3 text-muted-foreground/30 cursor-not-allowed">
                    <RefreshCw className="h-4 w-4" />
                    <span className="text-[10px] font-medium">Update</span>
                  </div>
                )}
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={6}>Update Knowledge Base</TooltipContent>
            </Tooltip>

            {/* Analytics */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to={`/analytics/${website.id}`} className="flex flex-col items-center justify-center gap-1 py-3 text-muted-foreground hover:bg-primary/8 hover:text-primary active:scale-95 transition-all duration-150">
                  <BarChart2 className="h-4 w-4" />
                  <span className="text-[10px] font-medium">Analytics</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={6}>Analytics</TooltipContent>
            </Tooltip>

            {/* Settings */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to={`/settings/${website.id}`} className="flex flex-col items-center justify-center gap-1 py-3 text-muted-foreground hover:bg-primary/8 hover:text-primary active:scale-95 transition-all duration-150">
                  <Settings className="h-4 w-4" />
                  <span className="text-[10px] font-medium">Settings</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={6}>Settings</TooltipContent>
            </Tooltip>

          </div>
        </motion.div>

        <UpdateKnowledgeModal
          websiteId={website.id}
          websiteName={website.name}
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          onSuccess={() => { onKnowledgeUpdated?.(); }}
          pdfEnabled={website.pdfEnabled ?? false}
        />
      </>
    </TooltipProvider>
  );
};

export default WebsiteCard;
