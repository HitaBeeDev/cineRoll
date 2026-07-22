import type { RandomFilmRow } from "../types";
import { calculateDimensionFactor } from "./calculateDimensionFactor";
import {
  CONTENT_TYPE_DECAY,
  DECADE_DECAY,
  DIRECTOR_DECAY,
  GENRE_DECAY,
} from "./decayPolicy";
import { getMainGenre } from "./getMainGenre";
import { getReleaseDecade } from "./getReleaseDecade";
import type { PinnedDimensions, RecentRoll } from "./types";

export const calculateDiversityMultiplier = (
  film: RandomFilmRow,
  recentRolls: RecentRoll[],
  pinned: PinnedDimensions,
): number => {
  if (recentRolls.length === 0) return 1;

  const genreFactor = calculateDimensionFactor(
    getMainGenre(film.genres), recentRolls, roll => roll.genre, GENRE_DECAY, pinned.genre,
  );
  const contentTypeFactor = calculateDimensionFactor(
    film.contentType, recentRolls, roll => roll.contentType,
    CONTENT_TYPE_DECAY, pinned.contentType,
  );
  const decadeFactor = calculateDimensionFactor(
    getReleaseDecade(film.year), recentRolls, roll => roll.decade,
    DECADE_DECAY, pinned.decade,
  );
  const directorFactor = calculateDimensionFactor(
    film.director, recentRolls, roll => roll.director,
    DIRECTOR_DECAY, pinned.director,
  );

  return genreFactor * contentTypeFactor * decadeFactor * directorFactor;
};
