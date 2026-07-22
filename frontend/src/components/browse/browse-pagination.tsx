import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Numbered pagination: first/last are always reachable, with the current page
 * and its immediate neighbours shown and the rest collapsed to ellipses — so
 * page 1, the last page, and a jump near the current spot are all one click,
 * which prev/next-only navigation never allowed across hundreds of pages.
 */
function paginationRange(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const left  = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);
  const range: (number | "ellipsis")[] = [1];

  if (left > 2) range.push("ellipsis");
  for (let p = left; p <= right; p++) range.push(p);
  if (right < total - 1) range.push("ellipsis");

  range.push(total);
  return range;
}

export function BrowsePagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const arrowClass =
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.035] text-[#a9a5bc] transition-colors hover:border-[#e8453c]/35 hover:text-white disabled:cursor-not-allowed disabled:opacity-25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]/30";

  return (
    <nav
      aria-label="Browse pagination"
      className="mt-14 flex flex-wrap items-center justify-center gap-1.5 border-t border-white/10 pt-6"
    >
      <button
        type="button"
        aria-label="Previous page"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className={arrowClass}
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
      </button>

      {paginationRange(page, totalPages).map((item, i) =>
        item === "ellipsis" ? (
          <span
            key={`ellipsis-${i}`}
            aria-hidden
            className="flex h-9 w-7 items-center justify-center font-[family-name:var(--font-geist-mono)] text-[12px] text-[#817c91]"
          >
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            aria-label={`Page ${item}`}
            aria-current={item === page ? "page" : undefined}
            onClick={() => onChange(item)}
            className={cn(
              "flex h-9 min-w-9 shrink-0 items-center justify-center rounded-md border px-2 font-[family-name:var(--font-geist-mono)] text-[12px] tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]/30",
              item === page
                ? "border-[#e8453c] bg-[#e8453c] text-white"
                : "border-white/10 bg-white/[0.035] text-[#a9a5bc] hover:border-[#e8453c]/35 hover:text-white",
            )}
          >
            {item.toLocaleString()}
          </button>
        ),
      )}

      <button
        type="button"
        aria-label="Next page"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className={arrowClass}
      >
        <ArrowRight className="h-3.5 w-3.5" aria-hidden />
      </button>
    </nav>
  );
}
