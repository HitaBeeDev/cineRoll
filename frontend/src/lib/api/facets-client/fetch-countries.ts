import { fetchStringFacet } from "./fetch-string-facet";

export function fetchCountries(): Promise<string[]> {
  return fetchStringFacet("countries");
}
