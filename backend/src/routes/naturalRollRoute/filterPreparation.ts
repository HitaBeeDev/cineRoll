import { randomQuerySchema, RandomQuery } from "../../lib/filmFilters/randomQuerySchema";
import { getAllowedFilterValues } from "../../lib/allowedFilterValues";
import { validateStructuralFilters } from "../../lib/validateFilters";
import { Stage1Filters } from "./schemas";
import { stripSoftFields } from "./softPreferences";

/** Stage-1 filters with the genre split folded into the query layer's shape:
 *  `genresAll` (AND — the film must be ALL required genres) plus `genres`
 *  (OR fallback). Relaxation drops `genresAll` first (AND → OR), then
 *  `genres` (no genre filter at all). */
export type EffectiveStructuralFilters = Stage1Filters & {
  genres?: string[] | undefined;
  genresAll?: string[] | undefined;
};

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

// Required genres are what the film must BE — the candidate pool demands ALL
// of them (`genresAll`, AND), because "romantic musical drama" means one film
// carrying all three, not any drama. The OR form (`genres`) rides along as the
// relaxation fallback. With no required genres, preferred genres still narrow
// the pool (OR) so "with music" isn't searched against the whole catalog.
function withEffectiveGenres(structuralFilters: Stage1Filters): EffectiveStructuralFilters {
  const required = structuralFilters.requiredGenres ?? [];
  const preferred = structuralFilters.preferredGenres ?? [];

  if (required.length > 0) {
    return {
      ...structuralFilters,
      genresAll: required,
      genres: required,
    };
  }

  return { ...structuralFilters, genres: preferred.length > 0 ? preferred : undefined };
}

export function naturalRollQuery(filters: Record<string, unknown>, userId: string | undefined): RandomQuery {
  return randomQuerySchema.parse({ ...filters, userId, limit: 1, page: 1 });
}
