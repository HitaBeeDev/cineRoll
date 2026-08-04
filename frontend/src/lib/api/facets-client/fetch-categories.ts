import { fetchStringFacet } from "./fetch-string-facet";

export function fetchCategories(): Promise<string[]> {
  return fetchStringFacet("categories");
}
