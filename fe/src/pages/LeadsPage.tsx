import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppShell from '@/components/layout/AppShell';
import PageProjectSwitcher from '@/components/common/PageProjectSwitcher';
import LeadRow from '@/components/dashboard/lead-row';
import LeadDrawer from '@/components/dashboard/lead-drawer';
import LeadsSkeleton, { TableRowsSkeleton } from '@/components/skeletons/LeadsSkeleton';
import { LEAD_FILTER_STATUSES, LEADS_PAGE_LIMIT } from '@/constants/leads.constants';
import { fadeUp, staggerContainer } from '@/lib/motion';
import leadsApiService, { Lead, LeadStatus, PaginatedLeads } from '@/services/leads-api';
import { toast } from 'sonner';

// ── EmptyState ────────────────────────────────────────────────────────────────

const EmptyState = ({ filtered }: { filtered: boolean }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10">
      <Users className="h-8 w-8 text-violet-500" />
    </div>
    <p className="text-sm font-semibold">
      {filtered ? 'No leads with this status' : 'No leads yet'}
    </p>
    <p className="mt-1 text-xs text-muted-foreground max-w-xs">
      {filtered
        ? 'Try selecting a different filter above.'
        : 'Leads captured from your chatbot widget will appear here automatically.'}
    </p>
  </div>
);

// ── LeadsPage ─────────────────────────────────────────────────────────────────

const LeadsPage = () => {
  const { id } = useParams<{ id: string }>();
  const websiteId = Number(id);

  const [data, setData] = useState<PaginatedLeads | null>(null);
  const [allCounts, setAllCounts] = useState<Record<LeadStatus, number>>({ new: 0, contacted: 0, qualified: 0, closed: 0 });
  const [totalAll, setTotalAll] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<LeadStatus | 'all'>('all');
  const [page, setPage] = useState(1);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);

  const mounted = useRef(false);

  // Fetch counts for every status in parallel — called once, never reset on tab change
  const fetchAllCounts = useCallback(async () => {
    if (!id) return;
    try {
      const [all, newR, contactedR, qualifiedR, closedR] = await Promise.all([
        leadsApiService.getLeads(websiteId, { page: 1, limit: 1 }),
        leadsApiService.getLeads(websiteId, { status: 'new',       page: 1, limit: 1 }),
        leadsApiService.getLeads(websiteId, { status: 'contacted', page: 1, limit: 1 }),
        leadsApiService.getLeads(websiteId, { status: 'qualified', page: 1, limit: 1 }),
        leadsApiService.getLeads(websiteId, { status: 'closed',    page: 1, limit: 1 }),
      ]);
      setTotalAll(all.total);
      setAllCounts({ new: newR.total, contacted: contactedR.total, qualified: qualifiedR.total, closed: closedR.total });
    } catch {
      // non-critical — counts stay at 0
    }
  }, [id, websiteId]);

  const fetchPage = useCallback(async (status: LeadStatus | 'all', p: number, showLoader: boolean) => {
    if (!id) return;
    if (showLoader) setTableLoading(true);
    try {
      const result = await leadsApiService.getLeads(websiteId, {
        status: status === 'all' ? undefined : status,
        page: p,
        limit: LEADS_PAGE_LIMIT,
      });
      setData(result);
    } catch {
      toast.error('Failed to load leads', { position: 'top-right' });
    } finally {
      setTableLoading(false);
    }
  }, [id, websiteId]);

  // Initial load: counts + first page together
  useEffect(() => {
    if (!id) return;
    setInitialLoading(true);
    Promise.all([fetchAllCounts(), fetchPage('all', 1, false)]).finally(() => {
      setInitialLoading(false);
      mounted.current = true;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tab / page change after mount
  useEffect(() => {
    if (!mounted.current) return;
    fetchPage(activeFilter, page, true);
  }, [activeFilter, page]);

  const handleFilterChange = (f: LeadStatus | 'all') => {
    setActiveFilter(f);
    setPage(1);
  };

  const handleStatusChange = useCallback((leadId: string, oldStatus: LeadStatus, newStatus: LeadStatus) => {
    setAllCounts((prev) => ({
      ...prev,
      [oldStatus]: Math.max(0, prev[oldStatus] - 1),
      [newStatus]: prev[newStatus] + 1,
    }));
    setData((prev) => {
      if (!prev) return prev;
      if (activeFilter !== 'all') {
        return { ...prev, total: Math.max(0, prev.total - 1), leads: prev.leads.filter((l) => l.id !== leadId) };
      }
      return { ...prev, leads: prev.leads.map((l) => l.id === leadId ? { ...l, status: newStatus } : l) };
    });
    if (activeLead?.id === leadId) {
      setActiveLead((prev) => prev ? { ...prev, status: newStatus } : prev);
    }
  }, [activeFilter, activeLead]);

  const countFor = (v: LeadStatus | 'all') => v === 'all' ? totalAll : allCounts[v];
  const showAction = activeFilter !== 'closed';

  return (
    <AppShell>
      <motion.div
        variants={staggerContainer(0.06, 0.04)}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* ── Header ── */}
        <motion.div variants={fadeUp()} className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-sm shadow-violet-500/25 shrink-0">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-left">Leads</h1>
              <p className="text-sm text-muted-foreground text-left">Visitors who reached out via your chatbot</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {totalAll > 0 && (
              <Badge variant="secondary" className="text-xs">{totalAll} total</Badge>
            )}
            {id && <PageProjectSwitcher currentId={id} section="leads" />}
          </div>
        </motion.div>

        {initialLoading ? (
          <LeadsSkeleton />
        ) : (
          <>
            {/* ── Filter pills ── */}
            <motion.div variants={fadeUp()} className="flex gap-2 flex-wrap">
              {LEAD_FILTER_STATUSES.map(({ value, label }) => {
                const active = activeFilter === value;
                return (
                  <button
                    key={value}
                    onClick={() => handleFilterChange(value)}
                    disabled={tableLoading}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all border ${
                      active
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                        : 'bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
                    }`}
                  >
                    {label}
                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                      active ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
                    }`}>
                      {countFor(value)}
                    </span>
                  </button>
                );
              })}
            </motion.div>

            {/* ── Lead list ── */}
            <motion.div variants={fadeUp()}>
              {tableLoading ? (
                <TableRowsSkeleton rows={LEADS_PAGE_LIMIT} />
              ) : !data || data.leads.length === 0 ? (
                <div className="bg-card border rounded-xl overflow-hidden">
                  <EmptyState filtered={activeFilter !== 'all'} />
                </div>
              ) : (
                <div className="bg-card border rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border/60 bg-muted/40">
                          <th className="py-2.5 pl-4 pr-3 text-left text-xs font-medium text-muted-foreground">Lead</th>
                          <th className="py-2.5 px-3 text-left text-xs font-medium text-muted-foreground hidden sm:table-cell">Contact</th>
                          <th className="py-2.5 px-3 text-left text-xs font-medium text-muted-foreground hidden lg:table-cell">Intent</th>
                          <th className="py-2.5 px-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                          <th className="py-2.5 px-3 text-left text-xs font-medium text-muted-foreground hidden md:table-cell">Time</th>
                          {showAction && (
                            <th className="py-2.5 pl-3 pr-4 text-right text-xs font-medium text-muted-foreground">Action</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {data.leads.map((lead, i) => (
                          <LeadRow
                            key={lead.id}
                            lead={lead}
                            index={i}
                            websiteId={websiteId}
                            showAction={showAction}
                            onStatusChange={handleStatusChange}
                            onOpen={setActiveLead}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>

            {/* ── Pagination ── */}
            {data && data.totalPages > 1 && (
              <motion.div variants={fadeUp()} className="flex items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  Page {data.page} of {data.totalPages} · {data.total} leads
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline" size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1 || tableLoading}
                    className="h-8 gap-1.5 text-xs"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />Prev
                  </Button>
                  <Button
                    variant="outline" size="sm"
                    onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                    disabled={page === data.totalPages || tableLoading}
                    className="h-8 gap-1.5 text-xs"
                  >
                    Next<ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </motion.div>
            )}
          </>
        )}
      </motion.div>

      {/* ── Lead detail drawer ── */}
      <AnimatePresence>
        {activeLead && (
          <LeadDrawer
            lead={activeLead}
            websiteId={websiteId}
            onClose={() => setActiveLead(null)}
            onStatusChange={handleStatusChange}
          />
        )}
      </AnimatePresence>
    </AppShell>
  );
};

export default LeadsPage;
