import type { NaturalRollInterpreted } from "@/lib/api";
import { CAROUSEL_VISIBLE_COUNT } from "../carousel-config";
import { formatFilterChips } from "../format-filter-chips";
import { FilterChipList } from "./filter-chip-list";
import { SkeletonCard } from "./skeleton-card";

export function ProcessingPanel({
  interpreted,
}: {
  interpreted: NaturalRollInterpreted | null;
}) {
  const chips = interpreted
    ? formatFilterChips(interpreted.interpretedFilters)
    : [];

  return (
    <div className="flex h-full min-h-0 flex-col p-4">
      <div className="mb-3 flex shrink-0 flex-wrap items-center gap-2">
        <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.24em] text-[#e8453c]/80 motion-safe:animate-pulse">
          {interpreted ? "Ranking picks" : "Reading description"}
        </p>
        {interpreted?.relaxed && (
          <span className="rounded-full border border-[#2a2a3e] px-2 py-0.5 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest text-[#888899]">
            Relaxed filters
          </span>
        )}
        {chips.length > 0 && (
          <div className="ml-auto">
            <FilterChipList chips={chips} compact />
          </div>
        )}
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-3">
        {Array.from({ length: CAROUSEL_VISIBLE_COUNT }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    </div>
  );
}
