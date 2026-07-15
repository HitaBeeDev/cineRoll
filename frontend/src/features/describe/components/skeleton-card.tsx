export function SkeletonCard() {
  return (
    <div className="relative min-h-0 overflow-hidden rounded-lg border border-[#1e1e2a] bg-[#09090f]/70">
      <div className="absolute inset-0 bg-gradient-to-br from-[#15151f] to-[#0b0b12] motion-safe:animate-pulse" />
      <div className="relative z-10 flex h-full flex-col justify-end gap-2 p-3 sm:p-4">
        <div className="h-6 w-3/4 rounded bg-[#1e1e2a] motion-safe:animate-pulse" />
        <div className="h-3 w-1/2 rounded bg-[#161622] motion-safe:animate-pulse" />
        <div className="h-5 w-16 rounded-full bg-[#161622] motion-safe:animate-pulse" />
      </div>
    </div>
  );
}
