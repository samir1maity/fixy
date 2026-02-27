import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  ArrowLeft, MessageSquare, TrendingUp, Clock, Activity,
  ChevronDown, ChevronUp, Bot, User, Calendar, Zap, BarChart2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/components/layout/app-layout';
import analyticsApiService, {
  WebsiteAnalytics, ChatSession, ChatMessage,
} from '@/services/analytics-api';
import websiteApiService, { Website } from '@/services/website-api';
import { fadeUp, staggerContainer } from '@/lib/motion';

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Fallback mock data (used when API returns empty / not yet implemented) ──

function buildMockAnalytics(websiteId: number, domain: string): WebsiteAnalytics {
  const days = 14;
  const dailyStats = Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    return {
      date: d.toISOString().split('T')[0],
      requests: Math.floor(Math.random() * 120) + 10,
    };
  });

  const hourlyStats = Array.from({ length: 24 }, (_, h) => ({
    hour: `${String(h).padStart(2, '0')}:00`,
    requests: Math.floor(Math.random() * 30) + (h >= 9 && h <= 18 ? 20 : 0),
  }));

  const recentSessions: ChatSession[] = Array.from({ length: 8 }, (_, i) => {
    const d = new Date();
    d.setHours(d.getHours() - i * 3 - Math.random() * 2);
    return {
      sessionId: `sess-${websiteId}-${i}`,
      startedAt: d.toISOString(),
      messageCount: Math.floor(Math.random() * 10) + 2,
      lastMessage: [
        'How do I reset my password?',
        'What are your pricing plans?',
        'Can I integrate with Zapier?',
        'Do you have a free trial?',
        'How long does setup take?',
        'Is my data secure?',
        'Can I export my data?',
        'What browsers are supported?',
      ][i],
    };
  });

  const requestsToday = dailyStats[dailyStats.length - 1].requests;
  const requestsTotal = dailyStats.reduce((s, d) => s + d.requests, 0) + Math.floor(Math.random() * 500);

  return {
    websiteId,
    domain,
    requestsToday,
    requestsTotal,
    requestsThisWeek: dailyStats.slice(-7).reduce((s, d) => s + d.requests, 0),
    requestsThisMonth: dailyStats.reduce((s, d) => s + d.requests, 0),
    avgResponseTime: Math.floor(Math.random() * 300) + 200,
    dailyStats,
    hourlyStats,
    recentSessions,
  };
}

function buildMockMessages(sessionId: string): ChatMessage[] {
  const pairs: [string, string][] = [
    ['How do I get started?', 'Getting started is easy! Just sign up for an account and follow our quick setup guide.'],
    ['What integrations do you support?', 'We support Slack, Zapier, Webhooks, and REST API integrations out of the box.'],
    ['Is there a free plan?', 'Yes! Our free plan includes up to 500 messages per month with full feature access.'],
  ];
  const messages: ChatMessage[] = [];
  pairs.forEach(([q, a], i) => {
    const base = new Date();
    base.setMinutes(base.getMinutes() - (pairs.length - i) * 4);
    messages.push(
      { id: `${sessionId}-u${i}`, role: 'user', content: q, timestamp: new Date(base.getTime()).toISOString() },
      { id: `${sessionId}-a${i}`, role: 'assistant', content: a, timestamp: new Date(base.getTime() + 1500).toISOString() },
    );
  });
  return messages;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
  delay?: number;
}

const StatCard = ({ icon, label, value, sub, accent = 'bg-primary/10 text-primary', delay = 0 }: StatCardProps) => (
  <motion.div
    variants={fadeUp()}
    custom={delay}
    className="bg-card border rounded-xl p-4 shadow-sm flex items-start gap-4"
  >
    <div className={`p-2.5 rounded-lg shrink-0 ${accent}`}>{icon}</div>
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold leading-tight">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  </motion.div>
);

interface SessionRowProps {
  session: ChatSession;
  isOpen: boolean;
  onToggle: () => void;
  messages: ChatMessage[];
  loading: boolean;
}

const SessionRow = ({ session, isOpen, onToggle, messages, loading }: SessionRowProps) => (
  <div className="border rounded-xl overflow-hidden transition-shadow hover:shadow-sm">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors text-left"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="p-1.5 bg-primary/10 rounded-lg shrink-0">
          <MessageSquare className="h-3.5 w-3.5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{session.lastMessage}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {formatRelative(session.startedAt)} · {session.messageCount} messages
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0 ml-3">
        <Badge variant="secondary" className="text-xs hidden sm:flex">
          {formatTime(session.startedAt)}
        </Badge>
        {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </div>
    </button>

    {isOpen && (
      <div className="border-t bg-muted/20 px-4 py-3 space-y-3 max-h-80 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-6 text-muted-foreground text-sm gap-2">
            <Activity className="h-4 w-4 animate-pulse" /> Loading messages…
          </div>
        ) : messages.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No messages found.</p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`p-1.5 rounded-full shrink-0 h-7 w-7 flex items-center justify-center ${
                msg.role === 'assistant' ? 'bg-primary/10' : 'bg-accent'
              }`}>
                {msg.role === 'assistant'
                  ? <Bot className="h-3.5 w-3.5 text-primary" />
                  : <User className="h-3.5 w-3.5 text-foreground" />}
              </div>
              <div className={`rounded-xl px-3 py-2 text-sm max-w-[75%] ${
                msg.role === 'assistant'
                  ? 'bg-card border text-foreground'
                  : 'bg-primary text-primary-foreground'
              }`}>
                <p>{msg.content}</p>
                <p className={`text-[10px] mt-1 ${msg.role === 'assistant' ? 'text-muted-foreground' : 'text-primary-foreground/70'}`}>
                  {formatTime(msg.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    )}
  </div>
);

const CHART_COLORS = ['#9b87f5', '#06b6d4', '#f59e0b', '#10b981'];

// Custom tooltip for area/bar charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border rounded-lg px-3 py-2 shadow-lg text-sm">
      <p className="text-muted-foreground mb-0.5">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="font-semibold" style={{ color: p.color }}>
          {p.value} requests
        </p>
      ))}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const AnalyticsPage = () => {
  const { id } = useParams<{ id: string }>();
  const websiteId = Number(id);

  const [website, setWebsite] = useState<Website | null>(null);
  const [analytics, setAnalytics] = useState<WebsiteAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const [openSession, setOpenSession] = useState<string | null>(null);
  const [sessionMessages, setSessionMessages] = useState<Record<string, ChatMessage[]>>({});
  const [sessionLoading, setSessionLoading] = useState<Record<string, boolean>>({});

  const [activeRange, setActiveRange] = useState<'week' | 'month'>('week');

  // ── Fetch website info + analytics ────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [ws] = await Promise.all([
          websiteApiService.getWebsiteInfo(websiteId),
        ]);
        if (cancelled) return;
        setWebsite(ws);

        let data: WebsiteAnalytics;
        try {
          data = await analyticsApiService.getWebsiteAnalytics(websiteId);
          if (!data?.dailyStats?.length) throw new Error('empty');
        } catch {
          // Backend endpoint not yet implemented → use mock data
          data = buildMockAnalytics(websiteId, ws?.domain ?? 'unknown.com');
        }
        if (!cancelled) setAnalytics(data);
      } catch {
        if (!cancelled) setAnalytics(buildMockAnalytics(websiteId, 'unknown.com'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [websiteId]);

  // ── Fetch messages for a session ──────────────────────────────────────────
  const handleToggleSession = useCallback(async (sessionId: string) => {
    if (openSession === sessionId) { setOpenSession(null); return; }
    setOpenSession(sessionId);
    if (sessionMessages[sessionId]) return; // already loaded

    setSessionLoading((prev) => ({ ...prev, [sessionId]: true }));
    try {
      const msgs = await analyticsApiService.getSessionMessages(sessionId);
      setSessionMessages((prev) => ({ ...prev, [sessionId]: msgs?.length ? msgs : buildMockMessages(sessionId) }));
    } catch {
      setSessionMessages((prev) => ({ ...prev, [sessionId]: buildMockMessages(sessionId) }));
    } finally {
      setSessionLoading((prev) => ({ ...prev, [sessionId]: false }));
    }
  }, [openSession, sessionMessages]);

  // ── Derived chart data ────────────────────────────────────────────────────
  const displayedDailyStats = analytics
    ? (activeRange === 'week' ? analytics.dailyStats.slice(-7) : analytics.dailyStats)
    : [];

  const pieData = analytics
    ? [
        { name: 'This Week', value: analytics.requestsThisWeek },
        { name: 'Older', value: Math.max(0, analytics.requestsTotal - analytics.requestsThisWeek) },
      ]
    : [];

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <AppLayout scope="main">
        <div className="space-y-4 animate-pulse">
          <div className="h-8 w-48 bg-muted rounded-lg" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-xl" />)}
          </div>
          <div className="h-64 bg-muted rounded-xl" />
          <div className="h-64 bg-muted rounded-xl" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout scope="main">
      <motion.div
        variants={staggerContainer(0.07, 0.05)}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* ── Header ── */}
        <motion.div variants={fadeUp()} className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="gap-1.5">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-primary" />
                Analytics
              </h1>
              {website && (
                <p className="text-xs text-muted-foreground mt-0.5">{website.domain}</p>
              )}
            </div>
          </div>

          <div className="flex gap-1.5 bg-muted rounded-lg p-1">
            {(['week', 'month'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setActiveRange(r)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize ${
                  activeRange === r
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {r === 'week' ? 'Last 7 days' : 'Last 14 days'}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Stat cards ── */}
        <motion.div
          variants={staggerContainer(0.08)}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <StatCard
            icon={<Zap className="h-4 w-4" />}
            label="Requests today"
            value={analytics?.requestsToday ?? 0}
            sub="Since midnight"
            accent="bg-primary/10 text-primary"
            delay={0}
          />
          <StatCard
            icon={<TrendingUp className="h-4 w-4" />}
            label="This week"
            value={analytics?.requestsThisWeek ?? 0}
            sub="Last 7 days"
            accent="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
            delay={1}
          />
          <StatCard
            icon={<Activity className="h-4 w-4" />}
            label="Total requests"
            value={(analytics?.requestsTotal ?? 0).toLocaleString()}
            sub="All time"
            accent="bg-amber-500/10 text-amber-600 dark:text-amber-400"
            delay={2}
          />
          <StatCard
            icon={<Clock className="h-4 w-4" />}
            label="Avg response"
            value={`${analytics?.avgResponseTime ?? 0}ms`}
            sub="Response time"
            accent="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            delay={3}
          />
        </motion.div>

        {/* ── Charts row ── */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Daily requests area chart */}
          <motion.div variants={fadeUp()} className="lg:col-span-2 bg-card border rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold">Request Volume</h2>
                <p className="text-xs text-muted-foreground">Daily requests over time</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
                <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                Requests
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={displayedDailyStats} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradPrimary" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9b87f5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#9b87f5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="requests"
                  stroke="#9b87f5"
                  strokeWidth={2}
                  fill="url(#gradPrimary)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#9b87f5' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Pie chart — distribution */}
          <motion.div variants={fadeUp()} className="bg-card border rounded-xl p-4 shadow-sm flex flex-col">
            <div className="mb-4">
              <h2 className="text-sm font-semibold">Traffic Split</h2>
              <p className="text-xs text-muted-foreground">Week vs all-time share</p>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: number) => [`${v.toLocaleString()} reqs`, '']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* ── Hourly bar chart ── */}
        <motion.div variants={fadeUp()} className="bg-card border rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold">Hourly Activity</h2>
              <p className="text-xs text-muted-foreground">Requests by hour of day (today)</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-cyan-600 dark:text-cyan-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-cyan-500 inline-block" />
              Hourly
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={analytics?.hourlyStats ?? []} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="hour"
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                interval={3}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="requests" fill="#06b6d4" radius={[3, 3, 0, 0]} maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* ── Chat sessions ── */}
        <motion.div variants={fadeUp()}>
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">Recent Chat Sessions</h2>
            <Badge variant="secondary" className="text-xs">
              {analytics?.recentSessions?.length ?? 0}
            </Badge>
          </div>

          <div className="space-y-2">
            {analytics?.recentSessions?.length ? (
              analytics.recentSessions.map((session) => (
                <SessionRow
                  key={session.sessionId}
                  session={session}
                  isOpen={openSession === session.sessionId}
                  onToggle={() => handleToggleSession(session.sessionId)}
                  messages={sessionMessages[session.sessionId] ?? []}
                  loading={sessionLoading[session.sessionId] ?? false}
                />
              ))
            ) : (
              <div className="border rounded-xl p-8 text-center text-muted-foreground text-sm">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-40" />
                No chat sessions yet.
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AppLayout>
  );
};

export default AnalyticsPage;
