// ─── Shared pulse wrapper ─────────────────────────────────────────────────────

const Bone = ({ className }: { className: string }) => (
  <div className={`rounded bg-muted animate-pulse ${className}`} />
);

// ─── Left summary card ────────────────────────────────────────────────────────

const ProfileCardSkeleton = () => (
  <div className="col-span-1 bg-card border rounded-xl p-5 flex flex-col items-center text-center">
    {/* Avatar */}
    <Bone className="h-20 w-20 rounded-full mb-4" />
    {/* Name + email + org */}
    <Bone className="h-4 w-32 mb-2" />
    <Bone className="h-3 w-40 mb-1.5" />
    <Bone className="h-3 w-24 mb-4" />
    {/* Account details section */}
    <div className="w-full mt-5 pt-5 border-t space-y-2">
      <Bone className="h-3.5 w-28 mb-3" />
      <div className="flex justify-between">
        <Bone className="h-3 w-10" />
        <Bone className="h-3 w-16" />
      </div>
      <div className="flex justify-between">
        <Bone className="h-3 w-20" />
        <Bone className="h-3 w-16" />
      </div>
    </div>
  </div>
);

// ─── Right edit form ──────────────────────────────────────────────────────────

const EditFormSkeleton = () => (
  <div className="col-span-1 md:col-span-2 bg-card border rounded-xl p-5 space-y-5">
    <Bone className="h-5 w-28 mb-2" />
    {/* 3 labeled input fields */}
    {[...Array(3)].map((_, i) => (
      <div key={i} className="space-y-2">
        <Bone className="h-3.5 w-24" />
        <Bone className="h-9 w-full rounded-md" />
      </div>
    ))}
    <Bone className="h-9 w-32 rounded-md" />
  </div>
);

// ─── ProfileSkeleton (full page) ─────────────────────────────────────────────

const ProfileSkeleton = () => (
  <div>
    {/* Page heading */}
    <div className="mb-6">
      <Bone className="h-7 w-36" />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <ProfileCardSkeleton />
      <EditFormSkeleton />
    </div>
  </div>
);

export default ProfileSkeleton;
