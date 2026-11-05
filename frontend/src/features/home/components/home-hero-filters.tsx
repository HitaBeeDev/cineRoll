"use client";

import { FilterBar } from "@/components/filter-bar";
import { cn } from "@/lib/utils/cn";
import type { HomeHeroFiltersProps } from "../component-props";
import { useScrollOverflow } from "../use-scroll-overflow";

export function HomeHeroFilters({ hero, filters, genres, hasActiveFilters, onFiltersChange, onClearFilters }: HomeHeroFiltersProps) {
  const filterScroll = useScrollOverflow<HTMLDivElement>();

  // The top mask fades content out as it scrolls up under the channel header,
  // instead of slicing it at a hard edge. The pane's top padding plus the
  // hero's top margin cover the fade, so nothing is faded until it scrolls.
  return (
    <div data-vital="home-filters" className="relative flex min-w-0 flex-col lg:min-h-0 lg:flex-1">
      <div
        ref={filterScroll.ref}
        onScroll={filterScroll.onScroll}
        data-lenis-prevent
        className="flex min-w-0 flex-col lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pt-5 lg:[mask-image:linear-gradient(to_bottom,transparent,black_2rem)] [scrollbar-width:none] [&::-webkit-scrollbar]:w-0"
      >
        <div className="lg:flex lg:grow lg:shrink-0 lg:flex-col lg:justify-center">
          <div data-filtered={hasActiveFilters || undefined} className={cn("group/hero mt-3 max-w-full transition-all duration-300 sm:mt-2", hasActiveFilters ? "mb-5 sm:mb-6" : "mb-7 sm:mb-10")} style={{ fontSize: hasActiveFilters ? "clamp(2.75rem,min(14.5vw,8.9vh),5.15rem)" : "clamp(3.2rem,min(15.5vw,9.7vh),6rem)" }}>{hero}</div>
        </div>
        <FilterBar filters={filters} genres={genres} onFiltersChange={onFiltersChange} onClearFilters={onClearFilters} />
      </div>
      {/* On a short laptop screen this pane clips the last filter rows behind
          the Roll block, and its scrollbar is hidden by design — so the rows
          read as absent rather than below. The fade is the edge the missing bar
          would have drawn: present only while something is still down there,
          gone the moment the pane is at its end. */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 hidden h-14 bg-gradient-to-t from-ink-900 via-ink-900/70 to-transparent transition-opacity duration-200 lg:block",
          filterScroll.hasMore ? "opacity-100" : "opacity-0",
        )}
      />
    </div>
  );
}
