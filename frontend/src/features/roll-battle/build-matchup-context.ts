import type { RollFilm } from "@/lib/api";
import {
  getDecadeLabel,
  getPrimaryGenre,
  isDocumentary,
} from "./film-signals";

export function buildMatchupContext(left: RollFilm, right: RollFilm): string {
  const leftGenre = getPrimaryGenre(left);
  const rightGenre = getPrimaryGenre(right);

  if (leftGenre === rightGenre && leftGenre !== "archive") {
    return `${leftGenre} duel`;
  }
  if (isDocumentary(left) !== isDocumentary(right)) {
    return isDocumentary(left)
      ? "Documentary vs fiction"
      : "Fiction vs documentary";
  }

  return buildDistinctMatchupLabel(left, right, leftGenre, rightGenre);
}

function buildDistinctMatchupLabel(
  left: RollFilm,
  right: RollFilm,
  leftGenre: string,
  rightGenre: string,
): string {
  const leftDecade = getDecadeLabel(left);
  const rightDecade = getDecadeLabel(right);
  if (leftDecade && rightDecade && leftDecade !== rightDecade) {
    return `${leftDecade} ${leftGenre.toLowerCase()} vs ${rightDecade} ${rightGenre.toLowerCase()}`;
  }
  if (hasLargeRuntimeGap(left, right)) return "Short watch vs marathon commitment";
  if (hasLargeRatingGap(left, right)) {
    return "Archive underdog vs critical heavyweight";
  }
  return `${leftGenre} vs ${rightGenre}`;
}

function hasLargeRuntimeGap(left: RollFilm, right: RollFilm): boolean {
  if (left.runtime == null || right.runtime == null) return false;
  return Math.abs(left.runtime - right.runtime) >= 120;
}

function hasLargeRatingGap(left: RollFilm, right: RollFilm): boolean {
  if (left.imdbRating == null || right.imdbRating == null) return false;
  return Math.abs(left.imdbRating - right.imdbRating) >= 1;
}
