import type { FilterState } from "@cineroll/types";
import { DEFAULT_SORT_CHOICE } from "./default-sort-choice";
import { RELEVANCE_SORT_CHOICE } from "./relevance-sort-choice";
import { sortChoiceFromKey } from "./sort-choice-from-key";
import { sortChoiceKey } from "./sort-choice-key";

/**
 * A query changes what "best first" means, so typing one moves the order to
 * Relevance and clearing it moves the order back.
 *
 * Only from and to the default, though. Someone who picked "Oldest first" and
 * then searched still wants the oldest match, and silently reordering a list
 * they ordered themselves is the kind of help that reads as a bug. Likewise an
 * explicit sort in the same update wins — it is the user choosing.
 */
export function withSearchSort(
  current: FilterState,
  updates: Partial<FilterState>,
): Partial<FilterState> {
  if (updates.search === undefined || updates.sort !== undefined) return updates;

  const had = current.search.trim().length > 0;
  const has = updates.search.trim().length > 0;
  if (had === has) return updates;

  const currentChoice = sortChoiceKey(current.sort, current.sortOrder);
  if (has && currentChoice === DEFAULT_SORT_CHOICE) {
    return { ...updates, ...sortChoiceFromKey(RELEVANCE_SORT_CHOICE) };
  }
  if (!has && currentChoice === RELEVANCE_SORT_CHOICE) {
    return { ...updates, ...sortChoiceFromKey(DEFAULT_SORT_CHOICE) };
  }

  return updates;
}
