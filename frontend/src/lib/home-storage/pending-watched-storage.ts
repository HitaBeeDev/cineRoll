import { PENDING_WATCHED_STORAGE_KEY } from "./pending-watched-constants";
import type { PendingWatchedFilm } from "./onboarding-storage-types";

export function savePendingWatchedFilms(filmIds: string[]): void {
  if (filmIds.length === 0) return;

  try {
    const filmsById = readPendingWatchedFilms();
    addPendingWatchedFilms(filmsById, filmIds, new Date().toISOString());
    window.localStorage.setItem(
      PENDING_WATCHED_STORAGE_KEY,
      JSON.stringify([...filmsById.values()]),
    );
  } catch {
    // Storage must never prevent onboarding completion.
  }
}

function readPendingWatchedFilms(): Map<string, PendingWatchedFilm> {
  const raw = window.localStorage.getItem(PENDING_WATCHED_STORAGE_KEY) ?? "[]";
  const storedFilms = JSON.parse(raw) as Partial<PendingWatchedFilm>[];
  const filmsById = new Map<string, PendingWatchedFilm>();

  for (const film of storedFilms) {
    if (typeof film.filmId !== "string") continue;
    filmsById.set(
      film.filmId,
      createPendingFilm(film.filmId, validDateOrNow(film.watchedAt)),
    );
  }
  return filmsById;
}

function addPendingWatchedFilms(
  filmsById: Map<string, PendingWatchedFilm>,
  filmIds: string[],
  watchedAt: string,
): void {
  for (const filmId of filmIds) {
    filmsById.set(filmId, createPendingFilm(filmId, watchedAt));
  }
}

function createPendingFilm(
  filmId: string,
  watchedAt: string,
): PendingWatchedFilm {
  return { filmId, watchedAt, source: "onboarding", synced: false };
}

function validDateOrNow(value: unknown): string {
  return typeof value === "string" ? value : new Date().toISOString();
}
