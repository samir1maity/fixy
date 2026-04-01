// ─── Shared pulse wrapper ─────────────────────────────────────────────────────

const Bone = ({ className }: { className: string }) => (
  <div className={`rounded bg-muted animate-pulse ${className}`} />
);

// ─── Stat cards row ───────────────────────────────────────────────────────────

const StatCardsSkeleton = () => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="bg-card border rounded-xl p-5 flex items-start gap-4">
        <Bone className="h-9 w-9 rounded-lg shrink-0" />
        <div className="space-y-2 flex-1 min-w-0">
          <Bone className="h-2.5 w-16" />
          <Bone className="h-6 w-10" />
          <Bone className="h-2 w-20" />
        </div>
      </div>
    ))}
  </div>
);

// ─── Chart card skeleton ──────────────────────────────────────────────────────

const AREA_HEIGHTS = [40, 80, 60, 100, 75, 55, 90, 65, 45, 85, 70, 50, 95, 60] as const;
const BAR_HEIGHTS  = [30, 60, 45, 80, 55, 70, 40, 90, 50, 65, 35, 75, 55, 45,
                      85, 60, 40, 70, 50, 80, 65, 45, 90, 55] as const;

const AreaChartSkeleton = () => (
  <div className="bg-card border rounded-xl">
    <div className="px-6 pt-5 pb-2 space-y-1.5">
      <Bone className="h-3.5 w-24" />
      <Bone className="h-2.5 w-16" />
    </div>
    <div className="px-6 pb-5">
      {/* Y-axis + chart area */}
      <div className="flex gap-2 items-end h-[200px]">
        <div className="flex flex-col justify-between h-full pb-5 shrink-0 space-y-0">
          {[...Array(5)].map((_, i) => (
            <Bone key={i} className="h-2 w-4" />
          ))}
        </div>
        <div className="flex-1 flex flex-col justify-end gap-0">
          {/* Simulated area fill */}
          <div className="flex items-end gap-1 h-[170px]">
            {AREA_HEIGHTS.map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t bg-primary/15 animate-pulse"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          {/* X-axis labels */}
          <div className="flex gap-1 mt-2">
            {[...Array(7)].map((_, i) => (
              <Bone key={i} className="flex-1 h-2" />
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const BarChartSkeleton = () => (
  <div className="bg-card border rounded-xl">
    <div className="px-6 pt-5 pb-2 space-y-1.5">
      <Bone className="h-3.5 w-36" />
      <Bone className="h-2.5 w-24" />
    </div>
    <div className="px-6 pb-5">
      <div className="flex gap-2 items-end h-[160px]">
        <div className="flex flex-col justify-between h-full pb-5 shrink-0 space-y-0">
          {[...Array(4)].map((_, i) => (
            <Bone key={i} className="h-2 w-4" />
          ))}
        </div>
        <div className="flex-1 flex flex-col justify-end">
          <div className="flex items-end gap-0.5 h-[130px]">
            {BAR_HEIGHTS.map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t bg-primary/20 animate-pulse"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          <div className="flex gap-1 mt-2">
            {[...Array(6)].map((_, i) => (
              <Bone key={i} className="flex-1 h-2" />
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ─── Recent sessions skeleton ─────────────────────────────────────────────────

const RecentSessionsSkeleton = () => (
  <div className="bg-card border rounded-xl">
    <div className="px-6 pt-5 pb-2 space-y-1.5">
      <Bone className="h-3.5 w-28" />
      <Bone className="h-2.5 w-40" />
    </div>
    <div className="divide-y">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-5 py-3">
          <Bone className="h-7 w-7 rounded-lg shrink-0" />
          <div className="flex-1 space-y-1.5 min-w-0">
            <Bone className="h-3 w-3/4" />
            <Bone className="h-2.5 w-1/3" />
          </div>
          <Bone className="h-4 w-4 shrink-0" />
        </div>
      ))}
    </div>
  </div>
);

// ─── AnalyticsSkeleton (full page) ────────────────────────────────────────────

const AnalyticsSkeleton = () => (
  <div className="space-y-6">
    <StatCardsSkeleton />
    <AreaChartSkeleton />
    <BarChartSkeleton />
    <RecentSessionsSkeleton />
  </div>
);

export default AnalyticsSkeleton;
