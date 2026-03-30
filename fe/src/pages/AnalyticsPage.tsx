import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { MessageSquare, TrendingUp, CalendarDays, Clock, ChevronRight, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppShell from '@/components/layout/AppShell';
import PageProjectSwitcher from '@/components/common/PageProjectSwitcher';
import analyticsApiService, { WebsiteAnalytics, ChatMessage } from '@/services/analytics-api';
import { TIMEZONES } from '@/constants/timezones.constants';

// ── Stat card ─────────────────────────────────────────────────────────────────

const StatCard = ({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: number | string;
  sub?: string;
  icon: React.ReactNode;
}) => (
  <Card>
    <CardContent className="p-5 flex items-start gap-4">
      <div className="p-2.5 rounded-lg bg-primary/10 shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        <p className="text-2xl font-bold leading-none">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </div>
    </CardContent>
  </Card>
);

// ── Session message drawer ────────────────────────────────────────────────────

const SessionDrawer = ({
  sessionId,
  onClose,
}: {
  sessionId: string;
  onClose: () => void;
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApiService.getSessionMessages(sessionId)
      .then(setMessages)
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));
  }, [sessionId]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-background border-l flex flex-col h-full shadow-xl">
        <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
          <p className="text-sm font-semibold">Session replay</p>
          <button
            onClick={onClose}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Close
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading && (
            <p className="text-sm text-muted-foreground text-center pt-8">Loading…</p>
          )}
          {!loading && messages.length === 0 && (
            <p className="text-sm text-muted-foreground text-center pt-8">No messages found.</p>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Chart tooltip ─────────────────────────────────────────────────────────────

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border rounded-lg px-3 py-2 text-xs shadow-md">
      <p className="text-muted-foreground mb-0.5">{label}</p>
      <p className="font-semibold">{payload[0].value} chats</p>
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────

const AnalyticsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<WebsiteAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<7 | 14 | 30>(7);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [timezone, setTimezone] = useState<string>(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    analyticsApiService
      .getWebsiteAnalytics(Number(id), timezone)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [id, timezone]);

  // Slice daily stats based on selected range
  const dailySlice = data?.dailyStats.slice(-range) ?? [];

  return (
    <AppShell>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold">Analytics</h1>
          {data && (
            <p className="text-sm text-muted-foreground mt-0.5">{data.name || data.domain}</p>
          )}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Timezone picker */}
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger className="h-8 text-xs w-44 gap-1.5">
              <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONES.map((tz) => (
                <SelectItem key={tz.value} value={tz.value} className="text-xs">
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* Range toggle */}
          <div className="flex gap-1 bg-muted rounded-lg p-1 text-xs font-medium">
            {([7, 14, 30] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  range === r
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {r}d
              </button>
            ))}
          </div>
          {id && <PageProjectSwitcher currentId={id} section="analytics" />}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
          Loading analytics…
        </div>
      )}

      {!loading && !data && (
        <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
          Failed to load analytics.
        </div>
      )}

      {!loading && data && (
        <div className="space-y-6">
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Today"
              value={data.todayChats}
              sub="chats so far"
              icon={<Clock className="h-4 w-4 text-primary" />}
            />
            <StatCard
              label="This week"
              value={data.weekChats}
              sub="last 7 days"
              icon={<CalendarDays className="h-4 w-4 text-primary" />}
            />
            <StatCard
              label="This month"
              value={data.monthChats}
              sub="last 30 days"
              icon={<TrendingUp className="h-4 w-4 text-primary" />}
            />
            <StatCard
              label="All time"
              value={data.totalChats}
              sub="total chats"
              icon={<MessageSquare className="h-4 w-4 text-primary" />}
            />
          </div>

          {/* Daily chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Daily chats</CardTitle>
              <CardDescription className="text-xs">Last {range} days</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={dailySlice} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => v.slice(5)} // "MM-DD"
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="requests"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#areaGrad)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Hourly chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Hourly chats (today)</CardTitle>
              <CardDescription className="text-xs">Activity by hour</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={data.hourlyStats} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="hour"
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    tickLine={false}
                    axisLine={false}
                    interval={3}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar
                    dataKey="requests"
                    fill="hsl(var(--primary))"
                    radius={[3, 3, 0, 0]}
                    maxBarSize={24}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent sessions */}
          {data.recentSessions.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Recent sessions</CardTitle>
                <CardDescription className="text-xs">Click to replay conversation</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ul className="divide-y">
                  {data.recentSessions.map((s) => (
                    <li key={s.sessionId}>
                      <button
                        onClick={() => setActiveSession(s.sessionId)}
                        className="w-full flex items-center gap-3 px-5 py-3 hover:bg-accent transition-colors text-left"
                      >
                        <div className="p-1.5 rounded-lg bg-primary/10 shrink-0">
                          <MessageSquare className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{s.lastMessage}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {s.messageCount} message{s.messageCount !== 1 ? 's' : ''} ·{' '}
                            {new Date(s.startedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      </button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Session replay drawer */}
      {activeSession && (
        <SessionDrawer
          sessionId={activeSession}
          onClose={() => setActiveSession(null)}
        />
      )}
    </AppShell>
  );
};

export default AnalyticsPage;
