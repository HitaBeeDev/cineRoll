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

// Shuffle-bag anti-repeat: film ids served this session. The roll excludes these
// so it doesn't repeat a title until the reachable pool is exhausted, then the
// bag resets. Kept in sessionStorage so a fresh tab/session starts clean.
export const ROLL_SEEN_STORAGE_KEY = "cineroll_roll_seen";
// Cap the bag: it rides in the request query string, so an unbounded list over a
// multi-thousand-film pool would blow past URL limits. For narrow filter sets
// (pool < cap) this still covers the whole pool — true shuffle-bag behavior with
// a reset; for the broad pool it degrades to a sliding "don't repeat recently"
// window, which captures nearly all of the perceived benefit.
export const MAX_ROLL_SEEN_IDS = 100;

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

/** Film ids already served this session (most-recent last), for anti-repeat. */
export function getRolledBag(): string[] {
  try {
    const raw = window.sessionStorage.getItem(ROLL_SEEN_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

/** Record a served film, keeping the bag de-duped and capped to the most recent. */
export function addToRolledBag(filmId: string): void {
  try {
    const bag = getRolledBag().filter((id) => id !== filmId);
    bag.push(filmId);
    const capped = bag.slice(-MAX_ROLL_SEEN_IDS);
    window.sessionStorage.setItem(ROLL_SEEN_STORAGE_KEY, JSON.stringify(capped));
  } catch {
    // Anti-repeat is a nicety; rolling must keep working if storage is blocked.
  }
}

/** Empty the bag — used when the session has exhausted the reachable pool. */
export function resetRolledBag(): void {
  try {
    window.sessionStorage.removeItem(ROLL_SEEN_STORAGE_KEY);
  } catch {
    // non-critical
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
