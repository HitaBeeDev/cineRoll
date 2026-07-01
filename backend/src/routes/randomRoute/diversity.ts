import { RandomQuery } from "../../lib/filmFilters/randomQuerySchema";
import { RandomFilmRow } from "./types";

// Session diversity engine (docs/smart-roll-engine.md §6). When a user keeps
// rolling, we remember the last few rolls and softly penalize a candidate that
// repeats a *dimension* (main genre / content type / decade / director) that
// showed up recently — so three dramas or three '90s films in a row become
// unlikely without ever being hard-banned. Each dimension is a DECAYING
// multiplier keyed to how recently it appeared: heavy right after it showed,
// fading back to 1.0 (no penalty) as it ages out of the window. Soft, not a
// ban, so a thin pool self-heals instead of dead-ending (§10).

// One recent roll, reduced to just the dimensions we diversify on. Built
// server-side from the tail of the session shuffle-bag (`excludeIds`).
export type RecentRoll = {
  genre: string | null; // main (first) genre
  contentType: string;
  decade: number | null;
  director: string | null;
};

// Decay tables, index 0 = most-recent roll. A match at index i multiplies the
// candidate's weight by table[i]; matches past the table length cost nothing.
// The window length per dimension is just the table length.
const GENRE_DECAY = [0.15, 0.4, 0.7]; // last 3 rolls
const TYPE_DECAY = [0.3, 0.6]; // last 2 rolls
const DECADE_DECAY = [0.4, 0.7]; // last 2 rolls
const DIRECTOR_DECAY = [0.5, 0.6, 0.7, 0.8, 0.9]; // last 5 rolls, mild

// How many recent rolls we need to look back at — the longest window above.
export const RECENT_ROLL_WINDOW = DIRECTOR_DECAY.length;

// Which dimensions the user pinned via filters. §8: filter > algorithm — never
// cool down a dimension the user explicitly asked for (selecting Genre=Animation
// is a promise to show animation, not a preference to diversify away from it).
export type PinnedDimensions = {
  genre: boolean;
  contentType: boolean;
  decade: boolean;
  director: boolean;
};

export function pinnedDimensions(query: RandomQuery): PinnedDimensions {
  return {
    genre: hasValues(query.genre),
    contentType: hasValues(query.contentType),
    decade: query.decadeMin != null || query.decadeMax != null,
    director: query.director != null,
  };
}

function hasValues(value: string[] | undefined): boolean {
  return Array.isArray(value) && value.length > 0;
}

export function mainGenre(genres: string[]): string | null {
  return genres[0] ?? null;
}

export function decadeOf(year: number | null): number | null {
  return year == null ? null : Math.floor(year / 10) * 10;
}

// Most-recent decay factor for a single dimension: scan recent rolls newest→
// oldest, and the first one that matches within the table's window sets the
// penalty. No match (or a pinned dimension) → 1.0 (no penalty).
function dimensionFactor<T>(
  candidate: T,
  recent: RecentRoll[],
  pick: (roll: RecentRoll) => T,
  decay: number[],
  pinned: boolean,
): number {
  if (pinned || candidate == null) return 1;
  const window = Math.min(recent.length, decay.length);
  for (let i = 0; i < window; i++) {
    if (pick(recent[i]!) === candidate) return decay[i]!;
  }
  return 1;
}

// Combined diversity multiplier in (0, 1] for one candidate against the recent
// window. The four dimensions compound: a film that repeats both the recent
// genre and the recent decade is penalized on both.
export function diversityMultiplier(
  film: RandomFilmRow,
  recent: RecentRoll[],
  pinned: PinnedDimensions,
): number {
  if (recent.length === 0) return 1;
  return (
    dimensionFactor(mainGenre(film.genres), recent, r => r.genre, GENRE_DECAY, pinned.genre) *
    dimensionFactor(film.contentType, recent, r => r.contentType, TYPE_DECAY, pinned.contentType) *
    dimensionFactor(decadeOf(film.year), recent, r => r.decade, DECADE_DECAY, pinned.decade) *
    dimensionFactor(film.director, recent, r => r.director, DIRECTOR_DECAY, pinned.director)
  );
}
