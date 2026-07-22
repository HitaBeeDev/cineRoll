import type { AwardBodyFilter, FilterState } from "@cineroll/types";
import { DEFAULT_FILTERS } from "@/hooks/useFilters";
import { filtersToParams } from "@/lib/api";

const VALID_AWARD_BODIES: AwardBodyFilter[] = ["oscar", "goldenglobe", "cannes", "berlin"];

function numberParam(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Parse a comma-separated multi-select param into a trimmed, non-empty list. */
function listParam(value: string | null): string[] {
  return value ? value.split(",").map((s) => s.trim()).filter(Boolean) : [];
}

export function filtersFromSearchParams(params: URLSearchParams): FilterState {
  const awardYear      = numberParam(params.get("awardYear"));
  const decadeMin      = numberParam(params.get("decadeMin"));
  const decadeMax      = numberParam(params.get("decadeMax"));
  const imdbRatingMin  = numberParam(params.get("imdbRatingMin"));
  const runtimeMax     = numberParam(params.get("runtimeMax"));
  const nominationCount = numberParam(params.get("nominationCount"));
  const rtScoreMin     = numberParam(params.get("rtScoreMin"));
  const page           = numberParam(params.get("page"));
  const sort           = params.get("sort");
  const sortOrder      = params.get("sortOrder");

  // Browse intentionally reads only the filters its UI can set. The remaining
  // FilterState fields (director, certificate, tvType, imdbRatingMax) belong to
  // other surfaces (e.g. /ask-ai) and have no browse control, so they're left
  // at their DEFAULT_FILTERS values rather than parsed into a filter nobody here
  // could see or clear.
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
    awardYear,
    genres:        listParam(params.get("genre")),
    languages:     listParam(params.get("language")),
    countries:     listParam(params.get("country")),
    contentTypes:  listParam(params.get("contentType")),
    runtimeMax,
    decadeMin:     decadeMin ?? DEFAULT_FILTERS.decadeMin,
    decadeMax:     decadeMax ?? DEFAULT_FILTERS.decadeMax,
    nominationCount,
    imdbRatingMin: imdbRatingMin ?? DEFAULT_FILTERS.imdbRatingMin,
    rtScoreMin:    rtScoreMin ?? DEFAULT_FILTERS.rtScoreMin,
    imdbTopMoviesOnly: params.get("imdbTopMoviesOnly") === "true",
    imdbTopTvOnly:     params.get("imdbTopTvOnly")     === "true",
    sort:
      sort === "title" || sort === "rating" || sort === "rt" || sort === "awards" || sort === "newest"
        ? sort
        : DEFAULT_FILTERS.sort,
    sortOrder: sortOrder === "asc" || sortOrder === "desc" ? sortOrder : DEFAULT_FILTERS.sortOrder,
    page:          page && page > 0 ? page : DEFAULT_FILTERS.page,
  };
}

export function serializeFilters(filters: FilterState): string {
  const params = filtersToParams(filters);
  if (filters.page > 1) params.set("page", String(filters.page));
  return params.toString();
}
