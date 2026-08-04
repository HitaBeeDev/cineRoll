import { API_URL } from "@/lib/api/constants/api-url";
import type { AutocompleteResult } from "../discovery-types";

const EMPTY_AUTOCOMPLETE_RESULT: AutocompleteResult = {
  films: [],
  people: [],
};

export async function fetchAutocomplete(
  query: string,
): Promise<AutocompleteResult> {
  const params = new URLSearchParams({ q: query });
  const response = await fetch(`${API_URL}/api/autocomplete?${params}`);
  if (!response.ok) return EMPTY_AUTOCOMPLETE_RESULT;
  return response.json() as Promise<AutocompleteResult>;
}
