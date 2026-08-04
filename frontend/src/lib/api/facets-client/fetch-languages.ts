import { fetchStringFacet } from "./fetch-string-facet";

export function fetchLanguages(): Promise<string[]> {
  return fetchStringFacet("languages");
}
