import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  KeyRound, Eye, EyeOff, Copy, Check, RefreshCw,
  Globe, AlertCircle, ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import AppShell from '@/components/layout/AppShell';
import websiteApiService, { Website } from '@/services/website-api';
import { fadeUp, staggerContainer } from '@/lib/motion';
import { toast } from 'sonner';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function maskSecret(secret: string): string {
  if (!secret) return '••••••••••••••••••••••••••••••••';
  return secret.slice(0, 8) + '••••••••••••••••••••••••' + secret.slice(-4);
}

// ─── SecretCell ───────────────────────────────────────────────────────────────
// Handles reveal / copy for a single API secret.

interface SecretCellProps {
  secret: string;
}

const SecretCell = ({ secret }: SecretCellProps) => {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!secret) return;
    await navigator.clipboard.writeText(secret);
    setCopied(true);
    toast.success('API secret copied', { position: 'top-right', duration: 2500 });
    setTimeout(() => setCopied(false), 2000);
  }, [secret]);

  return (
    <div className="flex items-center gap-2 min-w-0">
      <code className="flex-1 min-w-0 truncate rounded bg-muted px-2 py-1 text-xs font-mono text-foreground select-all">
        {visible ? secret : maskSecret(secret)}
      </code>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide secret' : 'Reveal secret'}
        >
          {visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={handleCopy}
          aria-label="Copy secret"
          disabled={!secret}
        >
          {copied
            ? <Check className="h-3.5 w-3.5 text-emerald-500" />
            : <Copy className="h-3.5 w-3.5" />}
        </Button>
      </div>
    </div>
  );
};

// ─── StatusBadge ─────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<Website['status'], string> = {
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  pending:   'bg-amber-100  text-amber-700  dark:bg-amber-900/30  dark:text-amber-400',
  embedding: 'bg-amber-100  text-amber-700  dark:bg-amber-900/30  dark:text-amber-400',
  failed:    'bg-red-100    text-red-700    dark:bg-red-900/30    dark:text-red-400',
};

const STATUS_LABELS: Record<Website['status'], string> = {
  completed: 'Active',
  pending:   'Processing',
  embedding: 'Processing',
  failed:    'Failed',
};

const StatusBadge = ({ status }: { status: Website['status'] }) => (
  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}>
    <span className={`h-1.5 w-1.5 rounded-full ${
      status === 'completed' ? 'bg-emerald-500' :
      status === 'failed'    ? 'bg-red-500'     : 'bg-amber-500'
    }`} />
    {STATUS_LABELS[status]}
  </span>
);

// ─── RegenerateButton ─────────────────────────────────────────────────────────
// Isolated so that confirm state and loading state are per-row.

interface RegenerateButtonProps {
  websiteId: number;
  websiteName: string;
  disabled: boolean;
  onRegenerated: (websiteId: number, newSecret: string) => void;
}

const RegenerateButton = ({ websiteId, websiteName, disabled, onRegenerated }: RegenerateButtonProps) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const { secret } = await websiteApiService.regenerateSecret(websiteId);
      onRegenerated(websiteId, secret);
      toast.success('API secret regenerated', {
        description: 'The old key is now invalid. Update your embed snippet.',
        position: 'top-right',
        duration: 5000,
      });
    } catch {
      toast.error('Failed to regenerate secret', { position: 'top-right' });
    } finally {
      setLoading(false);
      setConfirmOpen(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        onClick={() => setConfirmOpen(true)}
        disabled={disabled || loading}
        aria-label="Regenerate API secret"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
        <span className="hidden sm:inline">Regenerate</span>
      </Button>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Regenerate API Secret?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will immediately invalidate the current secret for{' '}
              <strong>{websiteName}</strong>. Any embed snippet using the old key
              will stop working until you update it with the new secret.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, regenerate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

// ─── KeyRow ───────────────────────────────────────────────────────────────────
// Compact single-line row inside the table.

interface KeyRowProps {
  website: Website;
  index: number;
  onRegenerated: (websiteId: number, newSecret: string) => void;
}

const KeyRow = ({ website, index, onRegenerated }: KeyRowProps) => {
  const isActive = website.status === 'completed';

  return (
    <motion.tr
      variants={fadeUp()}
      custom={index}
      className="group border-b border-border/60 last:border-0 hover:bg-muted/30 transition-colors"
    >
      {/* Website identity */}
      <td className="py-3 pl-4 pr-3 w-[200px]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10">
            <Globe className="h-3.5 w-3.5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate leading-tight">{website.name}</p>
            <p className="text-[11px] text-muted-foreground truncate leading-tight">{website.domain}</p>
          </div>
        </div>
      </td>

      {/* Status */}
      <td className="py-3 px-3 w-24 shrink-0">
        <StatusBadge status={website.status} />
      </td>

      {/* Secret */}
      <td className="py-3 px-3">
        {isActive ? (
          <SecretCell secret={website.api_secret} />
        ) : (
          <span className="text-xs text-muted-foreground italic">Available after processing</span>
        )}
      </td>

      {/* Actions */}
      <td className="py-3 pl-3 pr-4 w-28 text-right">
        {isActive && (
          <RegenerateButton
            websiteId={website.id}
            websiteName={website.name}
            disabled={!isActive}
            onRegenerated={onRegenerated}
          />
        )}
      </td>
    </motion.tr>
  );
};

// ─── EmptyState ───────────────────────────────────────────────────────────────

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
      <KeyRound className="h-6 w-6 text-primary" />
    </div>
    <p className="text-sm font-medium">No websites yet</p>
    <p className="mt-1 text-xs text-muted-foreground max-w-xs">
      Add a website from the Projects page to get your first API key.
    </p>
  </div>
);

// ─── LoadingSkeleton ──────────────────────────────────────────────────────────

const LoadingSkeleton = () => (
  <div className="rounded-xl border bg-card overflow-hidden animate-pulse">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-border/60 last:border-0">
        <div className="flex items-center gap-2.5 w-[200px] shrink-0">
          <div className="h-6 w-6 rounded-md bg-muted" />
          <div className="space-y-1.5">
            <div className="h-3 w-24 rounded bg-muted" />
            <div className="h-2.5 w-16 rounded bg-muted" />
          </div>
        </div>
        <div className="h-5 w-14 rounded-full bg-muted" />
        <div className="flex-1 h-7 rounded-md bg-muted" />
        <div className="h-7 w-20 rounded-md bg-muted shrink-0" />
      </div>
    ))}
  </div>
);

// ─── ApiKeysPage ──────────────────────────────────────────────────────────────

const ApiKeysPage = () => {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    websiteApiService
      .getWebsites()
      .then((data) => { if (!cancelled) setWebsites(data ?? []); })
      .catch(() => { if (!cancelled) setWebsites([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const handleRegenerated = useCallback((websiteId: number, newSecret: string) => {
    setWebsites((prev) =>
      prev.map((w) => w.id === websiteId ? { ...w, api_secret: newSecret } : w)
    );
  }, []);

  const activeCount = websites.filter((w) => w.status === 'completed').length;

  return (
    <AppShell>
      <motion.div
        variants={staggerContainer(0.07, 0.05)}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* ── Page header ── */}
        <motion.div variants={fadeUp()} className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 shrink-0">
              <KeyRound className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">API Keys</h1>
              <p className="text-sm text-muted-foreground">
                Manage secret keys for all your knowledge bases
              </p>
            </div>
          </div>

          {!loading && activeCount > 0 && (
            <Badge variant="secondary" className="text-xs shrink-0">
              {activeCount} active {activeCount === 1 ? 'key' : 'keys'}
            </Badge>
          )}
        </motion.div>

        {/* ── Security notice ── */}
        <motion.div
          variants={fadeUp()}
          className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/20 p-4"
        >
          <ShieldCheck className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div className="space-y-1">
            {/* <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Keep your secrets safe</p> */}
            <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
              API secrets grant access to your chatbot. Never expose them in client-side code or public
              repositories. Regenerating a secret immediately invalidates the old one.
            </p>
          </div>
        </motion.div>

        {/* ── Key list ── */}
        {loading ? (
          <LoadingSkeleton />
        ) : websites.length === 0 ? (
          <EmptyState />
        ) : (
          <motion.div variants={fadeUp()} className="rounded-xl border bg-card overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/40">
                  <th className="py-2.5 pl-4 pr-3 text-left text-xs font-medium text-muted-foreground">Project</th>
                  <th className="py-2.5 px-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                  <th className="py-2.5 px-3 text-left text-xs font-medium text-muted-foreground">API Secret</th>
                  <th className="py-2.5 pl-3 pr-4 text-right text-xs font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <motion.tbody variants={staggerContainer(0.06)}>
                {websites.map((website, i) => (
                  <KeyRow
                    key={website.id}
                    website={website}
                    index={i}
                    onRegenerated={handleRegenerated}
                  />
                ))}
              </motion.tbody>
            </table>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AppShell>
  );
};

export default ApiKeysPage;
