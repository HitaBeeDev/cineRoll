// Client-side storage keys and persistence helpers shared by the home page and
// its onboarding / roll-history components. Extracted from the former monolithic
// home page so each consumer imports only what it needs and these stay
// independently unit-testable. All access window/sessionStorage at call time and
// is only invoked from client components.
import type { RollFilm, TasteCardFilm } from "@/lib/api";

export const PENDING_WATCHED_STORAGE_KEY = "cineroll_pending_watched_films";
export const TASTE_SEED_STORAGE_KEY = "cineroll_taste_seed";
export const ROLL_HISTORY_STORAGE_KEY = "roll_history";
export const MAX_ROLL_HISTORY_ITEMS = 10;

export type PendingWatchedFilm = {
  filmId: string;
  watchedAt: string;
  source: "onboarding";
  synced: false;
};

export type TasteSeed = {
  source: "onboarding";
  filmIds: string[];
  genres: string[];
  primaryGenre: string | null;
  createdAt: string;
};

export function savePendingWatchedFilms(filmIds: string[]) {
  if (filmIds.length === 0) return;

  try {
    const existing = JSON.parse(
      window.localStorage.getItem(PENDING_WATCHED_STORAGE_KEY) ?? "[]",
    ) as Partial<PendingWatchedFilm>[];
    const byFilmId = new Map<string, PendingWatchedFilm>();

    for (const item of existing) {
      if (typeof item.filmId !== "string") continue;
      byFilmId.set(item.filmId, {
        filmId: item.filmId,
        watchedAt:
          typeof item.watchedAt === "string"
            ? item.watchedAt
            : new Date().toISOString(),
        source: "onboarding",
        synced: false,
      });
    }

    const watchedAt = new Date().toISOString();
    for (const filmId of filmIds) {
      byFilmId.set(filmId, {
        filmId,
        watchedAt,
        source: "onboarding",
        synced: false,
      });
    }

    window.localStorage.setItem(
      PENDING_WATCHED_STORAGE_KEY,
      JSON.stringify([...byFilmId.values()]),
    );
  } catch {
    // If storage is unavailable, onboarding should still be completable.
  }
}

export function createTasteSeed(
  films: TasteCardFilm[],
  selectedFilmIds: string[],
): TasteSeed | null {
  if (selectedFilmIds.length === 0) return null;

  const selectedIds = new Set(selectedFilmIds);
  const selectedFilms = films.filter((film) => selectedIds.has(film.id));
  if (selectedFilms.length === 0) return null;

  const genreCounts = new Map<string, number>();
  for (const film of selectedFilms) {
    for (const genre of film.genres) {
      genreCounts.set(genre, (genreCounts.get(genre) ?? 0) + 1);
    }
  }

  const genres = [...genreCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([genre]) => genre);

  return {
    source: "onboarding",
    filmIds: selectedFilmIds,
    genres,
    primaryGenre: genres[0] ?? null,
    createdAt: new Date().toISOString(),
  };
}

export function saveTasteSeed(seed: TasteSeed | null) {
  if (!seed) return;

  try {
    window.localStorage.setItem(TASTE_SEED_STORAGE_KEY, JSON.stringify(seed));
  } catch {
    // If storage is unavailable, onboarding should still be completable.
  }
}

export function pushRollHistory(film: RollFilm) {
  try {
    const existing = JSON.parse(
      window.sessionStorage.getItem(ROLL_HISTORY_STORAGE_KEY) ?? "[]",
    ) as RollFilm[];
    const deduped = existing.filter((item) => item?.id !== film.id);
    const next = [film, ...deduped].slice(0, MAX_ROLL_HISTORY_ITEMS);
    window.sessionStorage.setItem(
      ROLL_HISTORY_STORAGE_KEY,
      JSON.stringify(next),
    );
  } catch {
    // Session history is non-critical; rolling should keep working if storage is blocked.
  }
}
