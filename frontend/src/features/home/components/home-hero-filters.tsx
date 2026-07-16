import { FilterBar } from "@/components/filter-bar";
import { cn } from "@/lib/utils";
import type { HomeHeroFiltersProps } from "../component-props";

export function HomeHeroFilters({ hero, filters, genres, hasActiveFilters, onFiltersChange, onClearFilters }: HomeHeroFiltersProps) {
  return (
    <div className="flex min-w-0 flex-col lg:min-h-0 lg:flex-1 lg:overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:w-0">
      <div className="lg:flex lg:grow lg:shrink-0 lg:flex-col lg:justify-center">
        <div className={cn("mt-3 max-w-full transition-all duration-300 sm:mt-2", hasActiveFilters ? "mb-5 sm:mb-6" : "mb-7 sm:mb-10")} style={{ fontSize: hasActiveFilters ? "clamp(2.75rem,min(14.5vw,8.9vh),5.15rem)" : "clamp(3.2rem,min(15.5vw,9.7vh),6rem)" }}>{hero}</div>
      </div>
      <FilterBar filters={filters} genres={genres} onFiltersChange={onFiltersChange} onClearFilters={onClearFilters} />
    </div>
  );
}
