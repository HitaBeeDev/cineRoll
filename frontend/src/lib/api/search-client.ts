import { API_URL } from "./constants";
import type { AutocompleteResult, PersonSuggestion } from "./discovery-types";

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

export async function fetchPersonSuggestions(
  query: string,
): Promise<PersonSuggestion[]> {
  const trimmedQuery = query.trim();
  if (trimmedQuery.length < 2) return [];

  const params = new URLSearchParams({ query: trimmedQuery, limit: "8" });
  const response = await fetch(`${API_URL}/api/films/people?${params}`);
  if (!response.ok) return [];
  const data = (await response.json()) as { people: PersonSuggestion[] };
  return data.people;
}
