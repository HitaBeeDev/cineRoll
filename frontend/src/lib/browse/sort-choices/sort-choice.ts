import type { FilterState } from "@cineroll/types";

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
