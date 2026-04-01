// ─── Shared pulse wrapper ─────────────────────────────────────────────────────

const Bone = ({ className }: { className: string }) => (
  <div className={`rounded bg-muted animate-pulse ${className}`} />
);

// ─── Tab bar ──────────────────────────────────────────────────────────────────

const TabsSkeleton = () => (
  <div className="flex gap-1 bg-muted rounded-lg p-1 w-fit mb-6">
    <Bone className="h-8 w-28 rounded-md" />
    <Bone className="h-8 w-28 rounded-md" />
  </div>
);

// ─── Single settings card ─────────────────────────────────────────────────────

const SettingsCardSkeleton = ({ inputRows = 1 }: { inputRows?: number }) => (
  <div className="bg-card border rounded-xl p-5 space-y-3">
    <div className="space-y-1.5">
      <Bone className="h-3.5 w-28" />
      <Bone className="h-2.5 w-48" />
    </div>
    {[...Array(inputRows)].map((_, i) => (
      <Bone key={i} className="h-9 w-full rounded-md" />
    ))}
  </div>
);

// ─── Position picker card ─────────────────────────────────────────────────────

const PositionCardSkeleton = () => (
  <div className="bg-card border rounded-xl p-5 space-y-3">
    <div className="space-y-1.5">
      <Bone className="h-3.5 w-28" />
      <Bone className="h-2.5 w-48" />
    </div>
    <div className="grid grid-cols-2 gap-3">
      <Bone className="h-20 w-full rounded-xl" />
      <Bone className="h-20 w-full rounded-xl" />
    </div>
  </div>
);

// ─── Live preview card ────────────────────────────────────────────────────────

const PreviewCardSkeleton = () => (
  <div className="hidden lg:block">
    <div className="bg-card border rounded-xl p-5 space-y-3 sticky top-6">
      <div className="space-y-1.5">
        <Bone className="h-3.5 w-24" />
        <Bone className="h-2.5 w-40" />
      </div>
      <Bone className="h-[420px] w-full rounded-xl" />
    </div>
  </div>
);

// ─── SettingsSkeleton (full page) ─────────────────────────────────────────────

const SettingsSkeleton = () => (
  <div>
    {/* Page heading */}
    <div className="mb-6 flex items-center gap-3">
      <Bone className="h-7 w-36" />
      <Bone className="h-7 w-28 rounded-md" />
    </div>

    <TabsSkeleton />

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: form cards */}
      <div className="space-y-5">
        <SettingsCardSkeleton />
        {/* Color card — color swatch + input + palette dots */}
        <div className="bg-card border rounded-xl p-5 space-y-3">
          <div className="space-y-1.5">
            <Bone className="h-3.5 w-28" />
            <Bone className="h-2.5 w-48" />
          </div>
          <div className="flex items-center gap-3">
            <Bone className="h-11 w-11 rounded-lg shrink-0" />
            <Bone className="h-9 flex-1 rounded-md" />
          </div>
          <div className="flex gap-2">
            {[...Array(8)].map((_, i) => (
              <Bone key={i} className="h-7 w-7 rounded-full" />
            ))}
          </div>
        </div>
        <SettingsCardSkeleton />
        {/* Welcome message — taller textarea */}
        <div className="bg-card border rounded-xl p-5 space-y-3">
          <div className="space-y-1.5">
            <Bone className="h-3.5 w-32" />
            <Bone className="h-2.5 w-44" />
          </div>
          <Bone className="h-20 w-full rounded-md" />
        </div>
        <PositionCardSkeleton />
        <Bone className="h-10 w-full rounded-md" />
      </div>

      {/* Right: live preview */}
      <PreviewCardSkeleton />
    </div>
  </div>
);

export default SettingsSkeleton;
