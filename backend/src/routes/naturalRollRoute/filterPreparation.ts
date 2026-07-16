import { randomQuerySchema, RandomQuery } from "../../lib/filmFilters/randomQuerySchema";
import { getAllowedFilterValues } from "../../lib/allowedFilterValues";
import { validateStructuralFilters } from "../../lib/validateFilters";
import { Stage1Filters } from "./schemas";
import { stripSoftFields } from "./softPreferences";

export type PreparedFilters = {
  allowed: Awaited<ReturnType<typeof getAllowedFilterValues>>;
  appliedFilters: Record<string, unknown>;
  droppedFilters: string[];
};

export async function prepareNaturalRollFilters(
  structuralFilters: Stage1Filters,
): Promise<PreparedFilters> {
  const allowed = await getAllowedFilterValues();
  // Soft fields (tones, themes, keywords, resultCount) are ranking signals,
  // not filters — they never reach validation or the query.
  const { filters, dropped } = validateStructuralFilters(stripSoftFields(structuralFilters), allowed);

  if (dropped.length > 0) {
    console.warn("Natural roll dropped invalid filter values:", dropped);
  }

  return {
    allowed,
    appliedFilters: filters,
    droppedFilters: dropped,
  };
}

export function naturalRollQuery(filters: Record<string, unknown>, userId: string | undefined): RandomQuery {
  return randomQuerySchema.parse({ ...filters, userId, limit: 1, page: 1 });
}
