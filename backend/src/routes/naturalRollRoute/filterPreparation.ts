import { randomQuerySchema, RandomQuery } from "../../lib/filmFilters/randomQuerySchema";
import { getAllowedFilterValues } from "../../lib/allowedFilterValues";
import { validateStructuralFilters } from "../../lib/validateFilters";
import { Stage1Filters } from "./schemas";

export type PreparedFilters = {
  allowed: Awaited<ReturnType<typeof getAllowedFilterValues>>;
  appliedFilters: Record<string, unknown>;
  droppedFilters: string[];
  query: RandomQuery;
};

export async function prepareNaturalRollFilters(
  structuralFilters: Stage1Filters,
  userId: string | undefined,
): Promise<PreparedFilters> {
  const allowed = await getAllowedFilterValues();
  const { filters, dropped } = validateStructuralFilters(structuralFilters, allowed);

  if (dropped.length > 0) {
    console.warn("Natural roll dropped invalid filter values:", dropped);
  }

  return {
    allowed,
    appliedFilters: filters,
    droppedFilters: dropped,
    query: naturalRollQuery(filters, userId),
  };
}

export function naturalRollQuery(filters: Record<string, unknown>, userId: string | undefined): RandomQuery {
  return randomQuerySchema.parse({ ...filters, userId, limit: 1, page: 1 });
}
