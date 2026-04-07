const Bone = ({ className }: { className: string }) => (
  <div className={`rounded bg-muted animate-pulse ${className}`} />
);

// ── Full page skeleton (initial load) ────────────────────────────────────────

const LeadsSkeleton = () => (
  <div className="space-y-6">
    {/* Filter pills */}
    <div className="flex gap-2 flex-wrap">
      {[...Array(5)].map((_, i) => (
        <Bone key={i} className="h-8 w-20 rounded-full" />
      ))}
    </div>

    {/* Table */}
    <TableRowsSkeleton rows={8} />
  </div>
);

// ── Table-only skeleton (tab / page change) ───────────────────────────────────

const TABLE_WIDTHS = [
  ['w-24', 'w-32'],   // Lead name + message
  ['w-28', 'w-20'],   // Email + company
  ['w-16'],           // Intent
  ['w-14'],           // Status badge
  ['w-10'],           // Time
] as const;

export const TableRowsSkeleton = ({ rows = 6 }: { rows?: number }) => (
  <div className="bg-card border rounded-xl overflow-hidden">
    {/* Header */}
    <div className="border-b border-border/60 bg-muted/40 flex gap-3 px-4 py-2.5">
      <Bone className="h-3 w-16" />
      <Bone className="h-3 w-16 hidden sm:block" />
      <Bone className="h-3 w-12 hidden lg:block ml-auto" />
      <Bone className="h-3 w-12" />
      <Bone className="h-3 w-10 hidden md:block" />
      <Bone className="h-3 w-14 ml-auto" />
    </div>
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-border/50 last:border-0">
        {/* Avatar + name/msg */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Bone className="h-8 w-8 rounded-full shrink-0" />
          <div className="space-y-1.5 min-w-0">
            <Bone className={`h-3 ${TABLE_WIDTHS[0][0]}`} />
            <Bone className={`h-2.5 ${TABLE_WIDTHS[0][1]}`} />
          </div>
        </div>
        {/* Email + company */}
        <div className="hidden sm:flex flex-col gap-1.5 w-36 shrink-0">
          <Bone className={`h-3 ${TABLE_WIDTHS[1][0]}`} />
          <Bone className={`h-2.5 ${TABLE_WIDTHS[1][1]}`} />
        </div>
        {/* Intent */}
        <Bone className="hidden lg:block h-5 w-20 rounded-full shrink-0" />
        {/* Status */}
        <Bone className="h-5 w-16 rounded-full shrink-0" />
        {/* Time */}
        <Bone className="hidden md:block h-3 w-10 shrink-0" />
        {/* Action */}
        <Bone className="h-7 w-20 rounded-md shrink-0" />
      </div>
    ))}
  </div>
);

export default LeadsSkeleton;
