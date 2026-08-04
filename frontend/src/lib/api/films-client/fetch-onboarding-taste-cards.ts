import type { PaginatedFilms } from "@cineroll/types";
import { API_URL } from "@/lib/api/constants/api-url";

export async function fetchOnboardingTasteCards(): Promise<
  PaginatedFilms["films"]
> {
  const params = new URLSearchParams({ sample: "onboarding", limit: "8" });
  const response = await fetch(`${API_URL}/api/films?${params}`, {
    cache: "no-store",
  });
  if (!response.ok) return [];
  const data = (await response.json()) as PaginatedFilms;
  return data.films;
}
