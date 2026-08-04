import { API_URL } from "@/lib/api/constants/api-url";
import { getCachedPromise } from "../promise-cache";
import type { StringFacet } from "./string-facet";

export function fetchStringFacet(facet: StringFacet): Promise<string[]> {
  return getCachedPromise(facet, async () => {
    const response = await fetch(`${API_URL}/api/films/${facet}`, {
      cache: "force-cache",
    });
    if (!response.ok) throw new Error(`${facet} ${response.status}`);
    return ((await response.json()) as Record<StringFacet, string[]>)[facet];
  }).catch(() => []);
}
