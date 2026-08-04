import type { FilterState } from "@cineroll/types";
import type { ActiveChip } from "./active-chip";
import { FILTER_DESCRIPTORS } from "@/lib/browse/filter-descriptors/filter-descriptors";
import type { SetFilters } from "./set-filters";

export function buildActiveChips(filters: FilterState, setFilters: SetFilters): ActiveChip[] {
  return FILTER_DESCRIPTORS.filter((d) => d.isActive(filters)).flatMap((d) => d.toChips(filters, setFilters));
}
