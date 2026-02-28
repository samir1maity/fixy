import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export { Skeleton };

// Fixed bar heights — deterministic, no Math.random() in render
const BAR_HEIGHTS = ['55%', '80%', '40%', '70%', '90%', '50%', '65%'];

// ── Stat card skeleton ─────────────────────────────────────────────────────
export const StatCardSkeleton = () => (
  <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
    <Skeleton className="h-3 w-24" />
    <Skeleton className="h-6 w-16" />
    <Skeleton className="h-2 w-32" />
  </div>
);

// ── Project card skeleton ──────────────────────────────────────────────────
export const ProjectCardSkeleton = () => (
  <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
    <div className="flex items-start justify-between">
      <div className="space-y-1.5">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-5 w-16 rounded-full" />
    </div>
    <div className="space-y-2 pt-2">
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-3/4" />
    </div>
    <div className="flex gap-2 pt-2">
      <Skeleton className="h-8 flex-1 rounded-lg" />
    </div>
  </div>
);

// ── Analytics chart skeleton ───────────────────────────────────────────────
export const ChartSkeleton = ({ className }: { className?: string }) => (
  <div className={cn('rounded-xl border border-border/60 bg-card p-4 space-y-3', className)}>
    <Skeleton className="h-4 w-32" />
    <Skeleton className="h-3 w-48" />
    <div className="flex items-end gap-2 pt-4 h-36">
      {BAR_HEIGHTS.map((h, i) => (
        <Skeleton key={i} className="flex-1 rounded-sm" style={{ height: h }} />
      ))}
    </div>
  </div>
);

// ── Page-level loading states ──────────────────────────────────────────────
export const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => <ProjectCardSkeleton key={i} />)}
    </div>
  </div>
);

export const AnalyticsSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
    </div>
    <ChartSkeleton className="h-80" />
    <ChartSkeleton className="h-64" />
  </div>
);
