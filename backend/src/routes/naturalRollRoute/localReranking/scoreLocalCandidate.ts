import type { RandomFilmRow } from "../../random";
import type { SoftPreferences } from "../softPreferences";
import { containsGoreSignal } from "./containsGoreSignal";
import { createFilmTokenSet } from "./createFilmTokenSet";
import type { LocalRerankContext } from "./localRerankContext";
import { scoreGenrePreference } from "./scoreGenrePreference";
import { scoreSoftSignals } from "./scoreSoftSignals";
import { scoreTokenRelevance } from "./scoreTokenRelevance";
import { violatesRequestedContentType } from "./violatesRequestedContentType";
import { LOCAL_RERANK_WEIGHTS } from "./weights";

export const scoreLocalCandidate = (
  film: RandomFilmRow,
  preferences: SoftPreferences,
  context: LocalRerankContext,
): number => {
  if (violatesRequestedContentType(film, preferences.contentType)) return -Infinity;

  const filmTokens = createFilmTokenSet(film);
  let score = scoreGenres(film, preferences);
  score += scoreSoftPreferences(preferences, filmTokens);
  score += scoreTokenRelevance(filmTokens, context.promptTokens, context.expandedTerms);
  score += qualityTieBreaker(film);
  score += intentAdjustment(film, filmTokens, context);

  return score;
};

const scoreGenres = (film: RandomFilmRow, preferences: SoftPreferences): number =>
  scoreGenrePreference(
    film,
    preferences.requiredGenres,
    LOCAL_RERANK_WEIGHTS.requiredGenreMissing,
  ) + scoreGenrePreference(
    film,
    preferences.preferredGenres,
    LOCAL_RERANK_WEIGHTS.preferredGenreMissing,
  );

const scoreSoftPreferences = (
  preferences: SoftPreferences,
  filmTokens: Set<string>,
): number =>
  scoreSoftSignals(preferences.tones, filmTokens) * LOCAL_RERANK_WEIGHTS.tone
  + scoreSoftSignals(preferences.themes, filmTokens) * LOCAL_RERANK_WEIGHTS.theme
  + scoreSoftSignals(preferences.keywords, filmTokens) * LOCAL_RERANK_WEIGHTS.keyword;

const qualityTieBreaker = (film: RandomFilmRow): number =>
  film.imdbRating == null ? 0 : Math.min(film.imdbRating / 10, 1);

const intentAdjustment = (
  film: RandomFilmRow,
  filmTokens: Set<string>,
  context: LocalRerankContext,
): number => {
  let adjustment = 0;
  const { promptIntent } = context;

  if (promptIntent.wantsUnderrated && !film.imdbTopMovieRank && !film.imdbTopTvRank) {
    adjustment += LOCAL_RERANK_WEIGHTS.underrated;
  }
  if (promptIntent.rejectsGore && containsGoreSignal(filmTokens)) {
    adjustment += LOCAL_RERANK_WEIGHTS.gore;
  }

  return adjustment;
};
