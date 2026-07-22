import { API_URL } from "./constants";
import type { PickOfDayFilm } from "./discovery-types";

export async function fetchPickOfDay(): Promise<PickOfDayFilm | null> {
  const response = await fetch(`${API_URL}/api/pick-of-day`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Failed to fetch pick of the day");
  return response.json() as Promise<PickOfDayFilm>;
}
