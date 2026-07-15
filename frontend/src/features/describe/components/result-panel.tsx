import type { NaturalRollResult } from "@/lib/api";
import { formatFilterChips } from "../format-filter-chips";
import { FilmCarousel } from "./film-carousel";
import { FilterChipList } from "./filter-chip-list";

export function ResultPanel({ result }: { result: NaturalRollResult }) {
  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col p-4">
      <div className="mb-3 flex min-w-0 shrink-0 flex-wrap items-center gap-2">
        <p className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.16em] text-[#e8453c]/80 sm:text-[11px] sm:tracking-[0.24em]">
          {result.films.length === 1 ? "Your roll" : `${result.films.length} picks`}
        </p>
        {result.relaxed && (
          <span className="rounded-full border border-[#2a2a3e] px-2 py-0.5 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest text-[#888899]">
            Relaxed filters
          </span>
        )}
        <div className="min-w-0 sm:ml-auto">
          <FilterChipList chips={formatFilterChips(result.interpretedFilters)} />
        </div>
      </div>
      <FilmCarousel films={result.films} />
    </div>
  );
}
