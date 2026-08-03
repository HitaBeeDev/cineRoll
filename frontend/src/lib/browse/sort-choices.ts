import type { FilterState } from "@cineroll/types";
import { DEFAULT_FILTERS } from "@/hooks/useFilters";

/**
 * Sorting is one choice, not two.
 *
 * It used to be a select ("Most wins") beside an icon-only asc/desc toggle, and
 * the pair could state things that were not true: flipped to ascending the
 * select still read "Most wins" while the grid showed the fewest, and "Title
 * A-Z" at the default descending order ran Z to A. Half the combinations were
 * also junk — "Most wins, ascending" is ~4,900 films tied at zero wins, one
 * click from the default and indistinguishable from a broken page.
 *
 * So direction lives in the label, the way every catalogue that ships this does
 * it (IMDb, Letterboxd, Amazon): one control, every option a real ordering, and
 * the words on screen are what the grid is doing. The wire format still carries
 * `sort` + `sortOrder` separately — shared links and the API are unchanged — and
 * this table is the only place the two are paired up.
 *
 * Reversals are listed only where the reverse means something. "Oldest" and
 * "Z–A" are real requests; "lowest IMDb rating" is not a way anyone browses an
 * award catalogue, and ascending win counts is the tied-at-zero view above.
 */
export type SortChoice = {
  /** `${sort}:${sortOrder}` — the pair the URL carries, addressable as one value. */
  value: string;
  label: string;
  sort: FilterState["sort"];
  sortOrder: FilterState["sortOrder"];
  /** Offered only while a search query is active (see `sortOptionsFor`). */
  searchOnly?: boolean;
};

function choice(
  sort: FilterState["sort"],
  sortOrder: FilterState["sortOrder"],
  label: string,
  searchOnly = false,
): SortChoice {
  return { value: sortChoiceKey(sort, sortOrder), label, sort, sortOrder, searchOnly };
}

export const SORT_CHOICES: SortChoice[] = [
  choice("relevance", "desc", "Relevance", true),
  choice("wins",      "desc", "Most wins"),
  choice("noms",      "desc", "Most nominations"),
  choice("newest",    "desc", "Newest first"),
  choice("newest",    "asc",  "Oldest first"),
  // Named by what they rank, not by where the number came from: "IMDb" and "RT"
  // are sources, and a list of sources beside a list of orderings reads as two
  // different kinds of answer to the same question.
  choice("rating",    "desc", "Highest IMDb rating"),
  choice("rt",        "desc", "Highest RT score"),
  choice("title",     "asc",  "Title (A–Z)"),
  choice("title",     "desc", "Title (Z–A)"),
];

export const DEFAULT_SORT_CHOICE = sortChoiceKey(DEFAULT_FILTERS.sort, DEFAULT_FILTERS.sortOrder);
export const RELEVANCE_SORT_CHOICE = sortChoiceKey("relevance", "desc");

export function sortChoiceKey(
  sort: FilterState["sort"],
  sortOrder: FilterState["sortOrder"],
): string {
  return `${sort}:${sortOrder}`;
}

/**
 * A key back into the pair the rest of the app stores. Unknown keys resolve to
 * the default rather than throwing: the value reaches here from a URL.
 */
export function sortChoiceFromKey(
  key: string,
): Pick<FilterState, "sort" | "sortOrder"> {
  const found = SORT_CHOICES.find((c) => c.value === key);

  return found
    ? { sort: found.sort, sortOrder: found.sortOrder }
    : { sort: DEFAULT_FILTERS.sort, sortOrder: DEFAULT_FILTERS.sortOrder };
}

/**
 * Snap an arbitrary sort/order pair onto a listed choice, so the state behind
 * the control can only ever be something the control can say out loud.
 *
 * This is what keeps the old links honest. `?sort=wins&sortOrder=asc` was
 * reachable before, and rendering it would put "Most wins" over a grid of films
 * that won nothing; it now lands on the ordering with that name. A pair with no
 * listed reversal keeps its `sort` and takes the direction that sort ships with.
 */
export function resolveSortChoice(
  sort: FilterState["sort"],
  sortOrder: FilterState["sortOrder"],
): Pick<FilterState, "sort" | "sortOrder"> {
  const exact = SORT_CHOICES.find((c) => c.sort === sort && c.sortOrder === sortOrder);
  const listed = exact ?? SORT_CHOICES.find((c) => c.sort === sort);

  return listed
    ? { sort: listed.sort, sortOrder: listed.sortOrder }
    : { sort: DEFAULT_FILTERS.sort, sortOrder: DEFAULT_FILTERS.sortOrder };
}

/** The orderings that exist for the current query state. */
export function sortOptionsFor(hasSearch: boolean): { value: string; label: string }[] {
  return SORT_CHOICES
    .filter((c) => !c.searchOnly || hasSearch)
    .map(({ value, label }) => ({ value, label }));
}

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
