// ─── Shared pulse wrapper ─────────────────────────────────────────────────────

const Bone = ({ className }: { className: string }) => (
  <div className={`rounded bg-muted animate-pulse ${className}`} />
);

// ─── Stat cards row ───────────────────────────────────────────────────────────

const StatsSkeleton = () => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="bg-card border rounded-lg p-3 sm:p-4">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <Bone className="h-8 w-8 rounded-full shrink-0" />
          <div className="space-y-1.5 flex-1">
            <Bone className="h-2.5 w-20" />
            <Bone className="h-5 w-10" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// ─── Website cards grid ───────────────────────────────────────────────────────

const WebsiteCardSkeleton = () => (
  <div className="bg-card border rounded-xl p-4 space-y-3">
    {/* Header row: icon + title + badge */}
    <div className="flex items-start justify-between gap-2">
      <div className="flex items-center gap-2.5 min-w-0">
        <Bone className="h-8 w-8 rounded-lg shrink-0" />
        <div className="space-y-1.5 min-w-0">
          <Bone className="h-3.5 w-24" />
          <Bone className="h-2.5 w-32" />
        </div>
      </div>
      <Bone className="h-5 w-14 rounded-full shrink-0" />
    </div>
    {/* Stat rows */}
    <div className="space-y-2 pt-1">
      <Bone className="h-2.5 w-28" />
      <Bone className="h-2.5 w-20" />
    </div>
    {/* Action buttons */}
    <div className="flex gap-2 pt-1">
      <Bone className="h-8 flex-1 rounded-lg" />
      <Bone className="h-8 flex-1 rounded-lg" />
    </div>
  </div>
);

const CardGridSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    {[...Array(4)].map((_, i) => (
      <WebsiteCardSkeleton key={i} />
    ))}
  </div>
);

// ─── DashboardSkeleton (full page) ────────────────────────────────────────────

const DashboardSkeleton = () => (
  <div className="space-y-5">
    {/* Page heading */}
    <div className="space-y-1.5">
      <Bone className="h-7 w-40" />
      <Bone className="h-3.5 w-56" />
    </div>

    {/* Stat cards */}
    <StatsSkeleton />

    {/* Search bar */}
    <Bone className="h-9 max-w-sm w-full rounded-md" />

    {/* Website cards */}
    <CardGridSkeleton />
  </div>
);

export default DashboardSkeleton;
