import { API_URL } from "@/lib/api/constants/api-url";
import type { PersonSuggestion } from "../discovery-types";

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
