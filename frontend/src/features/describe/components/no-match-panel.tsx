import type { NaturalRollFilters } from "@/lib/api";
import { formatFilterChips } from "../format-filter-chips";
import { SearchedFilterChips } from "./searched-filter-chips";

export function NoMatchPanel({ filters }: { filters: NaturalRollFilters }) {
  return (
    <div className="flex h-full flex-col justify-center p-6">
      <p className="mb-2 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.24em] text-[#e8453c]/70">
        No matching films
      </p>
      <h2 className="font-[family-name:var(--font-display)] text-4xl font-bold leading-none text-[#F5F5F0]">
        Try loosening the description.
      </h2>
      <p className="mt-3 max-w-xl font-[family-name:var(--font-geist-mono)] text-[11px] uppercase leading-5 tracking-widest text-[#8d8da1]">
        Gemini understood the request, but the film pool came back empty. Remove
        a year, award, rating, or exact person and roll again.
      </p>
      <SearchedFilterChips chips={formatFilterChips(filters)} />
    </div>
  );
}
