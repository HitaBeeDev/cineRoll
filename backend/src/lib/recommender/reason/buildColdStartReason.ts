import { filmFeatureKeys } from "../../tasteProfile";
import type { CandidateFilm } from "../types";
import { buildFallbackReason } from "./buildFallbackReason";
import { findTopAward } from "./findTopAward";

const HIGH_RATING_THRESHOLD = 7.5;

export const buildColdStartReason = (
  film: CandidateFilm,
  matchingGenre: string | null,
  index: number,
): string => {
  const genre = matchingGenre ?? film.genres[0] ?? null;
  const hooks = buildColdStartHooks(film, genre);

  return hooks[index % hooks.length] ?? buildFallbackReason(film);
};

const buildColdStartHooks = (film: CandidateFilm, genre: string | null): string[] => {
  const hooks: string[] = [];
  const noun = genre ?? "film";

  addRankingHook(hooks, film);
  addAwardHook(hooks, film, noun);
  addRatingHook(hooks, film, genre);
  addDecadeHook(hooks, film, genre);
  if (genre) hooks.push(`Popular in ${genre} — one of your starting genres.`);

  return hooks;
};

const addRankingHook = (hooks: string[], film: CandidateFilm): void => {
  const rank = film.imdbTopMovieRank ?? film.imdbTopTvRank;
  if (rank != null) hooks.push(`#${rank} on IMDb's Top 250 — start rating to calibrate.`);
};

const addAwardHook = (hooks: string[], film: CandidateFilm, noun: string): void => {
  const win = findTopAward(film, "win");
  if (win) {
    hooks.push(`A ${win}-winning ${noun} — a canonical pick to start rating.`);
    return;
  }

  const nomination = findTopAward(film, "nomination");
  if (nomination) hooks.push(`A ${nomination}-nominated ${noun} to start rating.`);
};

const addRatingHook = (
  hooks: string[],
  film: CandidateFilm,
  genre: string | null,
): void => {
  if (film.imdbRating == null || film.imdbRating < HIGH_RATING_THRESHOLD) return;

  hooks.push(
    genre
      ? `Among the highest-rated ${genre} films.`
      : "Among the highest-rated films to start rating.",
  );
};

const addDecadeHook = (
  hooks: string[],
  film: CandidateFilm,
  genre: string | null,
): void => {
  const decade = filmFeatureKeys(film).decade;
  if (decade && genre) hooks.push(`A ${decade} ${genre} to widen your taste.`);
};
