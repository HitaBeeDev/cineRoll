import { X } from "lucide-react";
import type { ActiveChip } from "@/lib/browse/filter-descriptors";

/** The removable filter chips plus the "Clear all" control below the filter bar. */
export function ActiveFilterChips({
  chips,
  onClearAll,
}: {
  chips: ActiveChip[];
  onClearAll: () => void;
}) {
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 pb-3">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={chip.onRemove}
          aria-label={`Remove ${chip.label} filter`}
          className="inline-flex h-7 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.045] px-2.5 font-[family-name:var(--font-geist-mono)] text-[12px] text-[#a9a5bc] transition-colors hover:border-[#e8453c]/45 hover:text-[#ff766d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]/30"
        >
          {chip.label}
          <X className="h-2.5 w-2.5 shrink-0" aria-hidden />
        </button>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="ml-1 inline-flex h-7 items-center gap-1.5 rounded-full border border-white/30 bg-white/[0.06] px-3 font-[family-name:var(--font-geist-mono)] text-[12px] uppercase tracking-[0.08em] text-[#f1eff8] transition-colors hover:border-white/55 hover:bg-white/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
      >
        <X className="h-3 w-3 shrink-0" aria-hidden />
        Clear all
      </button>
    </div>
  );
}
