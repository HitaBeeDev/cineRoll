import { Check, Link2 } from "lucide-react";
import type { FilterState } from "@cineroll/types";
import { useShareFilters } from "@/components/filter-bar/useShareFilters";

/** The "Rolling from: …" recipe summary with a one-tap share/copy affordance.
 *  Renders nothing when no filters are active (empty recipe). */
export function RollRecipeLine({
  filters,
  recipe,
}: {
  filters: FilterState;
  recipe: string;
}) {
  const { isCopied, share } = useShareFilters(filters, recipe);

  if (!recipe) return null;

  return (
    <p className="flex min-w-0 items-center gap-2 font-[family-name:var(--font-geist-mono)] text-[11px] tracking-wide text-[#686880]">
      <span className="min-w-0 break-words">
        <span className="text-[#444458]">Rolling from:</span>{" "}{recipe}
      </span>
      <button
        type="button"
        onClick={() => void share()}
        title="Share these filters"
        aria-label="Share these filters"
        className="shrink-0 text-[#444458] transition-colors hover:text-[#e8453c] focus-visible:outline-none focus-visible:text-[#e8453c]"
      >
        {isCopied
          ? <Check className="h-3 w-3" aria-hidden />
          : <Link2 className="h-3 w-3" aria-hidden />}
      </button>
    </p>
  );
}
