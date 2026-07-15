import { FilterChipList } from "./filter-chip-list";

export function SearchedFilterChips({ chips }: { chips: string[] }) {
  if (chips.length === 0) return null;

  return (
    <div className="mt-4">
      <p className="mb-2 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.22em] text-[#888899]">
        Searched for
      </p>
      <FilterChipList chips={chips} />
    </div>
  );
}
