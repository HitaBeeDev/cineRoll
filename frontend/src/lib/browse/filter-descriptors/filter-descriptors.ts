import { formatYearRange } from "@/lib/browse/year-range/format-year-range";
import { hasCeremonyYearRange } from "@/lib/browse/year-range/has-ceremony-year-range";
import { hasYearRange } from "@/lib/browse/year-range/has-year-range";
import { awardBodyLabel } from "@/lib/browse/labels/award-body-label";
import { contentTypeLabel } from "@/lib/browse/labels/content-type-label";
import { countryLabel } from "@/lib/browse/labels/country-label";
import { languageLabel } from "@/lib/browse/labels/language-label";
import type { FilterDescriptor } from "./filter-descriptor";
import { ceremonyChipLabel } from "./ceremony-chip-label";
import { facetChips } from "./facet-chips";
import { genreChips } from "./genre-chips";

export const FILTER_DESCRIPTORS: FilterDescriptor[] = [
  { band: "primary", isActive: (f) => !!f.search.trim(),
    toChips: (f, set) => [{ key: "search", label: `"${f.search.trim()}"`, onRemove: () => set({ search: "", page: 1 }) }] },
  { band: "primary", isActive: (f) => !!f.person.trim(),
    toChips: (f, set) => [{ key: "person", label: f.person.trim(), onRemove: () => set({ person: "", page: 1 }) }] },
  { band: "details", isActive: (f) => f.excludeWatched,
    toChips: (_f, set) => [{ key: "unwatched", label: "Not watched yet", onRemove: () => set({ excludeWatched: false, page: 1 }) }] },
  { band: "details", isActive: (f) => f.femaleDirectorOnly,
    toChips: (_f, set) => [{ key: "femaleDir", label: "Directed by a woman", onRemove: () => set({ femaleDirectorOnly: false, page: 1 }) }] },
  { band: "primary", isActive: (f) => f.awardBodies.length > 0,
    toChips: (f, set) => facetChips("body", f.awardBodies, awardBodyLabel, (awardBodies) => ({ awardBodies }), set) },
  { band: "primary", isActive: (f) => f.winnerOnly || f.nominatedOnly,
    toChips: (f, set) => [f.winnerOnly
      ? { key: "won", label: "Winner", onRemove: () => set({ winnerOnly: false, page: 1 }) }
      : { key: "nom", label: "Nominated", onRemove: () => set({ nominatedOnly: false, page: 1 }) }] },
  { band: "film", isActive: (f) => f.genres.length > 0, toChips: genreChips },
  { band: "details", isActive: (f) => f.languages.length > 0,
    toChips: (f, set) => facetChips("language", f.languages, languageLabel, (languages) => ({ languages }), set) },
  { band: "details", isActive: (f) => f.countries.length > 0,
    toChips: (f, set) => facetChips("country", f.countries, countryLabel, (countries) => ({ countries }), set) },
  { band: "awards", isActive: (f) => f.categories.length > 0,
    toChips: (f, set) => facetChips("cat", f.categories, (c) => c, (categories) => ({ categories }), set) },
  { band: "awards", isActive: hasCeremonyYearRange,
    toChips: (f, set) => [{
      key: "ceremony-year",
      // "1994 ceremony" / "1970-1979 ceremonies" — the bare year read as a
      // release year beside the release-year chip.
      label: ceremonyChipLabel(f),
      onRemove: () => set({ awardYearMin: null, awardYearMax: null, page: 1 }),
    }] },
  { band: "film", isActive: (f) => f.contentTypes.length > 0,
    toChips: (f, set) => facetChips("type", f.contentTypes, contentTypeLabel, (contentTypes) => ({ contentTypes }), set) },
  { band: "film", isActive: (f) => !!f.tvType,
    toChips: (f, set) => [{ key: "tvType", label: f.tvType, onRemove: () => set({ tvType: "", page: 1 }) }] },
  { band: "primary", isActive: (f) => f.imdbTopMoviesOnly,
    toChips: (_f, set) => [{ key: "imdbMovies", label: "IMDb Top 250 Films", onRemove: () => set({ imdbTopMoviesOnly: false, page: 1 }) }] },
  { band: "primary", isActive: (f) => f.imdbTopTvOnly,
    toChips: (_f, set) => [{ key: "imdbTv", label: "IMDb Top 250 TV", onRemove: () => set({ imdbTopTvOnly: false, page: 1 }) }] },
  { band: "film", isActive: (f) => f.imdbRatingMin > 0,
    toChips: (f, set) => [{ key: "imdb", label: `IMDb ${f.imdbRatingMin}+`, onRemove: () => set({ imdbRatingMin: 0, page: 1 }) }] },
  { band: "film", isActive: (f) => f.rtScoreMin > 0,
    toChips: (f, set) => [{ key: "rt", label: `RT ${f.rtScoreMin}%+`, onRemove: () => set({ rtScoreMin: 0, page: 1 }) }] },
  { band: "film", isActive: hasYearRange,
    toChips: (f, set) => [{ key: "year-range", label: formatYearRange(f), onRemove: () => set({ yearMin: null, yearMax: null, page: 1 }) }] },
  { band: "film", isActive: (f) => f.runtimeMin != null,
    toChips: (f, set) => [{ key: "runtime-min", label: `≥ ${f.runtimeMin}m`, onRemove: () => set({ runtimeMin: null, page: 1 }) }] },
  { band: "film", isActive: (f) => f.runtimeMax != null,
    toChips: (f, set) => [{ key: "runtime", label: `≤ ${f.runtimeMax}m`, onRemove: () => set({ runtimeMax: null, page: 1 }) }] },
  // Both wins bounds clear together, whichever one is set: they are two halves of
  // one control now (see awards-band's AWARDS_WON_OPTIONS), and a chip that
  // removed only its own half could leave the other one filtering invisibly.
  { band: "awards", isActive: (f) => f.winsMin != null && f.winsMin > 0,
    toChips: (f, set) => [{ key: "wins", label: `${f.winsMin}+ wins`, onRemove: () => set({ winsMin: null, winsMax: null, page: 1 }) }] },
  // 0 is a value here, not an absence: "never won anything" is the sharpest cut
  // this control makes, so the test is `!= null` rather than truthiness.
  { band: "awards", isActive: (f) => f.winsMax != null,
    toChips: (f, set) => [{
      key: "wins-max",
      label: f.winsMax === 0 ? "Never won" : `≤ ${f.winsMax} wins`,
      onRemove: () => set({ winsMin: null, winsMax: null, page: 1 }),
    }] },
  // No control on this page sets a nomination floor any more — the "Most
  // nominations" sort answers that better — but /ask-ai still can, and a link
  // carrying one has to stay removable.
  { band: "awards", isActive: (f) => f.nominationCount != null && f.nominationCount > 0,
    toChips: (f, set) => [{ key: "noms", label: `${f.nominationCount}+ noms`, onRemove: () => set({ nominationCount: null, page: 1 }) }] },
  { band: "awards", isActive: (f) => f.ceremonyCount != null && f.ceremonyCount > 1,
    toChips: (f, set) => [{
      key: "ceremonies",
      // "at 4 ceremonies" reads as a place; "by" is what a jury does.
      label: f.ceremonyCount === 4 ? "Recognised by all 4 ceremonies" : `Recognised by ${f.ceremonyCount}+ ceremonies`,
      onRemove: () => set({ ceremonyCount: null, page: 1 }),
    }] },
];
