import { API_URL } from "@/lib/api/constants/api-url";
import type { RollFilm } from "../roll-types";

export async function fetchFilmBySlug(slug: string): Promise<RollFilm> {
  const response = await fetch(
    `${API_URL}/api/films/${encodeURIComponent(slug)}`,
    { cache: "no-store" },
  );
  if (!response.ok) throw new Error("Failed to fetch film");
  return response.json() as Promise<RollFilm>;
}
