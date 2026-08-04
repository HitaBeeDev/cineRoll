import type { FilterState } from "@cineroll/types";
import { formatGenre } from "@/lib/format/format-genre";
import type { ActiveChip } from "./active-chip";
import type { SetFilters } from "./set-filters";
import { facetChips } from "./facet-chips";

/**
 * Genres, as one chip or several depending on how they combine.
 *
 * In the default OR mode each genre is its own constraint and gets its own
 * removable chip. Match-all is a single question — "romantic musical drama" —
 * and three separate chips would render it as the three-way OR it is not; so it
 * becomes one chip that reads the way the filter runs, and removing it drops the
 * whole phrase. Individual genres are still removable in the picker itself.
 */
export function genreChips(f: FilterState, set: SetFilters): ActiveChip[] {
  if (f.genresMatchAll && f.genres.length > 1) {
    return [{
      key: "genre-all",
      label: f.genres.map(formatGenre).join(" + "),
      onRemove: () => set({ genres: [], page: 1 }),
    }];
  }

  return facetChips("genre", f.genres, formatGenre, (genres) => ({ genres }), set);
}
