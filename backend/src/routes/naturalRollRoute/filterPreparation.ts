import { randomQuerySchema, RandomQuery } from "../../lib/filmFilters/randomQuerySchema";
import { getAllowedFilterValues } from "../../lib/allowedFilterValues";
import { validateStructuralFilters } from "../../lib/validateFilters";
import { Stage1Filters } from "./schemas";
import { stripSoftFields } from "./softPreferences";

/** Stage-1 filters with the genre split already folded into the single
 *  effective `genres` filter the query layer understands. This is the shape
 *  relaxation works on, so dropping "genres" relaxes whichever list was
 *  actually filtering. */
export type EffectiveStructuralFilters = Stage1Filters & { genres?: string[] | undefined };

export type PreparedFilters = {
  allowed: Awaited<ReturnType<typeof getAllowedFilterValues>>;
  appliedFilters: Record<string, unknown>;
  droppedFilters: string[];
  effectiveFilters: EffectiveStructuralFilters;
};

export async function prepareNaturalRollFilters(
  structuralFilters: Stage1Filters,
): Promise<PreparedFilters> {
  const allowed = await getAllowedFilterValues();
  const effectiveFilters = withEffectiveGenres(structuralFilters);
  // Soft fields (tones, themes, keywords, resultCount, the genre split) are
  // ranking signals, not filters — they never reach validation or the query.
  const { filters, dropped } = validateStructuralFilters(stripSoftFields(effectiveFilters), allowed);

  if (dropped.length > 0) {
    console.warn("Natural roll dropped invalid filter values:", dropped);
  }

  return {
    allowed,
    appliedFilters: filters,
    droppedFilters: dropped,
    effectiveFilters,
  };
}

// Required genres are what the film must BE — when present, they alone form
// the SQL genre filter. With none, preferred genres still narrow the pool
// (OR-overlap) so "with music" isn't searched against the whole catalog.
function withEffectiveGenres(structuralFilters: Stage1Filters): EffectiveStructuralFilters {
  const required = structuralFilters.requiredGenres ?? [];
  const preferred = structuralFilters.preferredGenres ?? [];
  const genres = required.length > 0 ? required : preferred;

  return { ...structuralFilters, genres: genres.length > 0 ? genres : undefined };
}

export function naturalRollQuery(filters: Record<string, unknown>, userId: string | undefined): RandomQuery {
  return randomQuerySchema.parse({ ...filters, userId, limit: 1, page: 1 });
}
