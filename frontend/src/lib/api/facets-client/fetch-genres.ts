import { fetchStringFacet } from "./fetch-string-facet";

export function fetchGenres(): Promise<string[]> {
  return fetchStringFacet("genres");
}
