import type { AwardBodyFilter, FilterState } from "@cineroll/types";
import { DEFAULT_FILTERS } from "@/hooks/useFilters/default-filters";
import { resolveSortChoice } from "@/lib/browse/sort-choices/resolve-sort-choice";

/**
 * The ordering a link asks for, snapped to one the sort control can name.
 *
 * Two links need fixing on the way in. `sortOrder=asc` on a sort with no listed
 * reversal is a combination the old direction toggle could produce and the new
 * select cannot say — it would render "Most wins" over the films that won least.
 * And `sort=relevance` without a `search` is relevant to nothing; the API
 * degrades it to the default ordering, so the control has to agree.
 */
function parseSortChoice(params: URLSearchParams): Pick<FilterState, "sort" | "sortOrder"> {
  const sort = parseSort(params.get("sort"));
  const order = params.get("sortOrder");
  const sortOrder = order === "asc" || order === "desc" ? order : DEFAULT_FILTERS.sortOrder;

  if (sort === "relevance" && !params.get("search")?.trim()) {
    return { sort: DEFAULT_FILTERS.sort, sortOrder: DEFAULT_FILTERS.sortOrder };
  }

  return resolveSortChoice(sort, sortOrder);
}

/**
 * The sort from a link. `awards` is the pre-split name for `wins` — it ordered
 * by wins and broke ties on nominations, which is what `wins` does — so older
 * links (and the stats page's leaderboard link) land on the ordering they meant
 * rather than falling back to the default.
 */
function parseSort(value: string | null): FilterState["sort"] {
  if (value === "awards") return "wins";

  return SORT_VALUES.find((sort) => sort === value) ?? DEFAULT_FILTERS.sort;
}

const SORT_VALUES: FilterState["sort"][] = [
  "relevance", "newest", "title", "rating", "rt", "wins", "noms",
];

const VALID_AWARD_BODIES: AwardBodyFilter[] = ["oscar", "goldenglobe", "cannes", "berlin"];

/** Parse a comma-separated multi-select param into a trimmed, non-empty list. */
function listParam(value: string | null): string[] {
  return value ? value.split(",").map((s) => s.trim()).filter(Boolean) : [];
}

function numberParam(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function filtersFromSearchParams(params: URLSearchParams): FilterState {
  const awardYear      = numberParam(params.get("awardYear"));
  // A bare `awardYear` in an older link is the range [y, y] — the same fold the
  // API does, so a shared link and a freshly built one read identically.
  const awardYearMin   = numberParam(params.get("awardYearMin")) ?? awardYear;
  const awardYearMax   = numberParam(params.get("awardYearMax")) ?? awardYear;
  // decadeMin/decadeMax are the pre-rename names for the same year bounds; links
  // shared or bookmarked before the rename must still resolve.
  const yearMin        = numberParam(params.get("yearMin")) ?? numberParam(params.get("decadeMin"));
  const yearMax        = numberParam(params.get("yearMax")) ?? numberParam(params.get("decadeMax"));
  const imdbRatingMin  = numberParam(params.get("imdbRatingMin"));
  const runtimeMin     = numberParam(params.get("runtimeMin"));
  const runtimeMax     = numberParam(params.get("runtimeMax"));
  const nominationCount = numberParam(params.get("nominationCount"));
  const ceremonyCount  = numberParam(params.get("ceremonyCount"));
  const winsMin        = numberParam(params.get("winsMin"));
  const winsMax        = numberParam(params.get("winsMax"));
  const rtScoreMin     = numberParam(params.get("rtScoreMin"));
  const page           = numberParam(params.get("page"));

  // The genres arrive under one of two names, and which one they came under IS
  // the mode: `genreAll` means the film must carry every one of them.
  const genresAll = listParam(params.get("genreAll"));
  const genres = genresAll.length > 0 ? genresAll : listParam(params.get("genre"));

  // Browse intentionally reads only the filters its UI can set. The remaining
  // FilterState fields (director, certificate, imdbRatingMax) belong to other
  // surfaces (e.g. /ask-ai) and have no browse control, so they're left at their
  // DEFAULT_FILTERS values rather than parsed into a filter nobody here could
  // see or clear.
  return {
    ...DEFAULT_FILTERS,
    search:           params.get("search")   ?? "",
    person:           params.get("person")   ?? "",
    femaleDirectorOnly: params.get("femaleDirectorOnly") === "true",
    awardBodies:   listParam(params.get("awardBody")).filter((b): b is AwardBodyFilter =>
                     (VALID_AWARD_BODIES as string[]).includes(b)),
    winnerOnly:    params.get("winnerOnly")    === "true",
    nominatedOnly: params.get("nominatedOnly") === "true",
    categories:    listParam(params.get("category")),
    awardYear: null,
    awardYearMin,
    awardYearMax,
    genres,
    genresMatchAll: genresAll.length > 0,
    languages:     listParam(params.get("language")),
    countries:     listParam(params.get("country")),
    contentTypes:  listParam(params.get("contentType")),
    tvType:        params.get("tvType") ?? "",
    runtimeMin,
    runtimeMax,
    yearMin,
    yearMax,
    nominationCount,
    ceremonyCount,
    winsMin,
    winsMax,
    imdbRatingMin: imdbRatingMin ?? DEFAULT_FILTERS.imdbRatingMin,
    rtScoreMin:    rtScoreMin ?? DEFAULT_FILTERS.rtScoreMin,
    imdbTopMoviesOnly: params.get("imdbTopMoviesOnly") === "true",
    imdbTopTvOnly:     params.get("imdbTopTvOnly")     === "true",
    excludeWatched:    params.get("excludeWatched")    === "true",
    ...parseSortChoice(params),
    page:          page && page > 0 ? page : DEFAULT_FILTERS.page,
  };
}
