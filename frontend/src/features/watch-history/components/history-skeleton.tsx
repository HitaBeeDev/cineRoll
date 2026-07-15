export function HistorySkeleton() {
  return (
    <>
      <div className="mt-2 h-3 w-28 animate-pulse rounded bg-[#111120]" />
      <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, index) => (
          <div
            key={index}
            className="aspect-[2/3] animate-pulse rounded-md border border-white/[0.08] bg-[#11111a]"
          />
        ))}
      </div>
    </>
  );
}
