import { motion } from 'framer-motion';
import { BarChart2, TrendingUp, Activity, Clock, Zap, Construction } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';

// ── Dummy blurred background cards ──────────────────────────────────────────

const FakeStatCard = ({ label }: { label: string }) => (
  <div className="bg-card border rounded-xl p-4 shadow-sm flex items-start gap-4 select-none">
    <div className="p-2.5 rounded-lg shrink-0 bg-primary/10 w-10 h-10" />
    <div className="space-y-1.5 flex-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="h-7 w-20 bg-muted rounded" />
      <div className="h-3 w-16 bg-muted/60 rounded" />
    </div>
  </div>
);

const FakeChartBlock = ({ height = 'h-52', className = '' }: { height?: string; className?: string }) => (
  <div className={`bg-card border rounded-xl p-4 shadow-sm ${height} ${className}`}>
    <div className="h-4 w-32 bg-muted rounded mb-1" />
    <div className="h-3 w-24 bg-muted/60 rounded mb-4" />
    <div className="flex items-end gap-1 h-28">
      {[40, 65, 50, 80, 55, 90, 70, 60, 85, 45, 75, 95, 55, 65].map((h, i) => (
        <div
          key={i}
          className="flex-1 bg-primary/20 rounded-t"
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  </div>
);

// ── Main page ─────────────────────────────────────────────────────────────────

const AnalyticsPage = () => {
  return (
    <AppShell>
      <div className="relative">
        {/* ── Blurred background (teaser) ── */}
        <div className="blur-sm pointer-events-none select-none space-y-6" aria-hidden>
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-primary" />
              Analytics
            </h1>
            <div className="flex gap-1.5 bg-muted rounded-lg p-1">
              <div className="px-3 py-1.5 rounded-md text-xs font-medium bg-background shadow-sm">Last 7 days</div>
              <div className="px-3 py-1.5 rounded-md text-xs font-medium text-muted-foreground">Last 14 days</div>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <FakeStatCard label="Requests today" />
            <FakeStatCard label="This week" />
            <FakeStatCard label="Total requests" />
            <FakeStatCard label="Avg response" />
          </div>

          {/* Charts row */}
          <div className="grid lg:grid-cols-3 gap-4">
            <FakeChartBlock height="h-64" className="lg:col-span-2" />
            <FakeChartBlock height="h-64" />
          </div>

          {/* Hourly */}
          <FakeChartBlock height="h-48" />

          {/* Sessions list */}
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="border rounded-xl px-4 py-3 flex items-center gap-3">
                <div className="p-1.5 bg-primary/10 rounded-lg w-7 h-7" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-48 bg-muted rounded" />
                  <div className="h-2.5 w-24 bg-muted/60 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Coming soon overlay ── */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-card border rounded-2xl shadow-xl p-8 flex flex-col items-center text-center max-w-sm mx-4"
          >
            <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
              <Construction className="h-7 w-7 text-amber-500" />
            </div>

            <h2 className="text-xl font-bold mb-2">Under Development</h2>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              We're working hard on this. Analytics will be available very soon — stay tuned!
            </p>

            <div className="w-full space-y-2 text-sm text-left">
              {[
                { icon: <Zap className="h-4 w-4 text-amber-500" />, text: 'Daily & hourly request charts' },
                { icon: <TrendingUp className="h-4 w-4 text-amber-500" />, text: 'Traffic trends over time' },
                { icon: <Activity className="h-4 w-4 text-amber-500" />, text: 'All-time usage stats' },
                { icon: <Clock className="h-4 w-4 text-amber-500" />, text: 'Chat session replay' },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-2.5 text-muted-foreground">
                  {icon}
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </AppShell>
  );
};

export default AnalyticsPage;
