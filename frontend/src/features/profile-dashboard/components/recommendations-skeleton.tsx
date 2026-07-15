export function RecommendationsSkeleton() {
  return (
    <section className="mt-16">
      <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[#F5F5F0]">
        Recommended for you
      </h2>
      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="flex flex-col">
            <div className="aspect-[2/3] w-full animate-pulse rounded-lg bg-[#111120]" />
            <div className="mt-3 h-3 w-3/4 animate-pulse rounded bg-[#111120]" />
            <div className="mt-2 h-2.5 w-1/3 animate-pulse rounded bg-[#0f0f18]" />
          </div>
        ))}
      </div>
    </section>
  );
}
