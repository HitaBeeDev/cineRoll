import type { FilterState } from "@cineroll/types";
import { DEFAULT_DECADE_MAX, DEFAULT_DECADE_MIN } from "./constants";

export function filtersToParams(
  filters: Partial<FilterState>,
): URLSearchParams {
  const params = new URLSearchParams();
  appendTextFilters(params, filters);
  appendFacetFilters(params, filters);
  appendRangeFilters(params, filters);
  appendRankingFilters(params, filters);
  appendSortFilters(params, filters);
  return params;
}

function appendTextFilters(
  params: URLSearchParams,
  filters: Partial<FilterState>,
): void {
  setTrimmed(params, "search", filters.search);
  setTrimmed(params, "person", filters.person);
  setTrimmed(params, "director", filters.director);
  setBoolean(params, "femaleDirectorOnly", filters.femaleDirectorOnly);
  setTrimmed(params, "certificate", filters.certificate);
  setTrimmed(params, "tvType", filters.tvType);
}

function appendFacetFilters(
  params: URLSearchParams,
  filters: Partial<FilterState>,
): void {
  setList(params, "awardBody", filters.awardBodies);
  setBoolean(params, "winnerOnly", filters.winnerOnly);
  setBoolean(params, "nominatedOnly", filters.nominatedOnly);
  setList(params, "category", filters.categories);
  setNumber(params, "awardYear", filters.awardYear);
  setList(params, "genre", filters.genres);
  setList(params, "language", filters.languages);
  setList(params, "country", filters.countries);
  setList(params, "contentType", filters.contentTypes);
}

function appendRangeFilters(
  params: URLSearchParams,
  filters: Partial<FilterState>,
): void {
  setNumber(params, "runtimeMax", filters.runtimeMax);
  setNonDefaultNumber(params, "decadeMin", filters.decadeMin, DEFAULT_DECADE_MIN);
  setNonDefaultNumber(params, "decadeMax", filters.decadeMax, DEFAULT_DECADE_MAX);
  setNumber(params, "nominationCount", filters.nominationCount);
  setPositiveNumber(params, "imdbRatingMin", filters.imdbRatingMin);
  setPositiveNumber(params, "rtScoreMin", filters.rtScoreMin);
  setNumber(params, "imdbRatingMax", filters.imdbRatingMax);
  setNumber(params, "winsMax", filters.winsMax);
}

function appendRankingFilters(
  params: URLSearchParams,
  filters: Partial<FilterState>,
): void {
  setBoolean(params, "imdbTopMoviesOnly", filters.imdbTopMoviesOnly);
  setBoolean(params, "imdbTopTvOnly", filters.imdbTopTvOnly);
  setBoolean(params, "imdbTopExclude", filters.imdbTopExclude);
}

function appendSortFilters(
  params: URLSearchParams,
  filters: Partial<FilterState>,
): void {
  if (filters.sort && filters.sort !== "newest") params.set("sort", filters.sort);
  if (filters.sortOrder && filters.sortOrder !== "desc") {
    params.set("sortOrder", filters.sortOrder);
  }
}

function setTrimmed(
  params: URLSearchParams,
  key: string,
  value?: string,
): void {
  const trimmedValue = value?.trim();
  if (trimmedValue) params.set(key, trimmedValue);
}

function setBoolean(
  params: URLSearchParams,
  key: string,
  value?: boolean,
): void {
  if (value) params.set(key, "true");
}

function setList(
  params: URLSearchParams,
  key: string,
  values?: string[],
): void {
  if (values?.length) params.set(key, values.join(","));
}

function setNumber(
  params: URLSearchParams,
  key: string,
  value?: number | null,
): void {
  if (value != null) params.set(key, String(value));
}

function setPositiveNumber(
  params: URLSearchParams,
  key: string,
  value?: number | null,
): void {
  if (value != null && value > 0) params.set(key, String(value));
}

function setNonDefaultNumber(
  params: URLSearchParams,
  key: string,
  value: number | null | undefined,
  defaultValue: number,
): void {
  if (value != null && value !== defaultValue) params.set(key, String(value));
}
