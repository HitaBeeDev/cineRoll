import { createApiError } from "@/lib/api/api-error/create-api-error";
import type { FilmStatus } from "../watched-types";

export async function fetchFilmStatus(filmId: string): Promise<FilmStatus> {
  const response = await fetch(
    `/api/user/film-status/${encodeURIComponent(filmId)}`,
  );
  if (!response.ok) throw await createApiError(response, "Failed to load film status");
  return response.json() as Promise<FilmStatus>;
}
