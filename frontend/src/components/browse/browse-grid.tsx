import { motion, useReducedMotion } from "framer-motion";
import { Clapperboard } from "lucide-react";
import type { FilterState, PaginatedFilms } from "@cineroll/types";
import { cn } from "@/lib/utils";
import { FilmTile, FilmTileSkeleton } from "@/components/film-tile";
import { BrowsePagination } from "@/components/browse/browse-pagination";
import { PAGE_SIZE, type LoadStatus } from "@/lib/browse/options";
import { statusFromFilters } from "@/lib/browse/filter-updates";

const GRID_CLASS =
  "grid min-w-0 grid-cols-2 gap-x-3 gap-y-6 [&>*]:min-w-0 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-9 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6";

/**
 * The results grid and its load/error/empty states. Holds the previous grid
 * (dimmed) through a quick refetch so cache-served filter taps don't flash
 * skeletons; only swaps to skeletons once a load is slow or there is no grid.
 */
export function BrowseGrid({
  status,
  result,
  filters,
  slowLoad,
  firstGridPaint,
  onRetry,
  onResetFilters,
  onPageChange,
}: {
  status: LoadStatus;
  result: PaginatedFilms | null;
  filters: FilterState;
  slowLoad: boolean;
  firstGridPaint: boolean;
  onRetry: () => void;
  onResetFilters: () => void;
  onPageChange: (page: number) => void;
}) {
  const shouldReduceMotion = useReducedMotion();

  const hasResult     = result != null;
  const hasGrid       = hasResult && (result?.films.length ?? 0) > 0;
  const showSkeleton  = status === "loading" && (!hasGrid || slowLoad);
  const showStaleGrid = status === "loading" && hasGrid && !slowLoad;
  const page       = result?.page ?? filters.page;
  const totalPages = Math.max(result?.totalPages ?? 1, 1);
  const awardStatus = statusFromFilters(filters);

  return (
    <>
      {/* Loading — only when there's no grid to hold or the load has gone slow */}
      {showSkeleton && (
        <div className={GRID_CLASS}>
          {Array.from({ length: PAGE_SIZE }).map((_, i) => <FilmTileSkeleton key={i} />)}
        </div>
      )}

      {status === "error" && (
        <div className="flex min-h-80 flex-col items-center justify-center gap-5 rounded-lg border border-dashed border-white/12 bg-white/[0.025] px-6 py-16 text-center">
          <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.32em] text-[#8e899e]">
            Something went wrong
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="rounded-full border border-[#e8453c]/35 px-4 py-2 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.24em] text-[#ff766d] transition-colors hover:border-[#e8453c]/70 hover:text-white"
          >
            Try again →
          </button>
        </div>
      )}

      {status === "success" && result?.films.length === 0 && (
        <div className="flex min-h-80 flex-col items-center justify-center gap-5 rounded-lg border border-dashed border-white/12 bg-white/[0.025] px-6 py-16 text-center">
          <Clapperboard className="h-10 w-10 text-[#555064]" aria-hidden />
          <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.28em] text-[#8e899e]">
            No films match — try adjusting your filters
          </p>
          <button
            type="button"
            onClick={onResetFilters}
            className="rounded-full border border-[#e8453c]/35 px-4 py-2 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.24em] text-[#ff766d] transition-colors hover:border-[#e8453c]/70 hover:text-white"
          >
            Reset filters →
          </button>
        </div>
      )}

      {(status === "success" || showStaleGrid) && result && result.films.length > 0 && (
        <div className={cn("transition-opacity duration-150", showStaleGrid && "pointer-events-none opacity-40")}>
          <div className={GRID_CLASS}>
            {result.films.map((film, index) => (
              <motion.div
                key={film.id}
                initial={{ opacity: 0, y: shouldReduceMotion || !firstGridPaint ? 0 : 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: shouldReduceMotion || !firstGridPaint ? 0 : Math.min(index * 0.025, 0.4),
                  duration: shouldReduceMotion ? 0 : firstGridPaint ? 0.22 : 0.16,
                  ease: "easeOut",
                }}
              >
                <FilmTile
                  film={film}
                  awardBodies={filters.awardBodies}
                  awardStatus={awardStatus}
                />
              </motion.div>
            ))}
          </div>

          <BrowsePagination page={page} totalPages={totalPages} onChange={onPageChange} />
        </div>
      )}
    </>
  );
}
