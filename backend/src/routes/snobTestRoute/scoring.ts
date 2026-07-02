import { SNOB_TEST_FILM_COUNT } from "./constants";
import { abilityPercentile, BallotItem, estimateAbility, filmDifficulty } from "./irt";
import { AwardBody, BreakdownBucket, ScoreFilmRow } from "./types";

// The score is an IRT ability percentile, not a raw seen/total ratio: because
// each ballot is randomized, having seen the *hard* (obscure) films counts for
// more than having seen an equal number of easy ones. See irt.ts /
// docs/algorithms.md §7.
export function scoreSnobTest(ballot: ScoreFilmRow[], seenIds: Set<string>) {
  const total = SNOB_TEST_FILM_COUNT;
  const seenFilms = ballot.filter(film => seenIds.has(film.id));
  const seen = Math.min(seenFilms.length, total);
  const score = irtScore(ballot, seenIds);

  return {
    score,
    title: titleForScore(score),
    seen,
    total,
    breakdown: buildBreakdown(seenFilms),
  };
}

// Latent ability -> 0..100 percentile. Seeing nothing is floored to 0: with no
// evidence there is no snobbery to measure, and it keeps the headline honest.
function irtScore(ballot: ScoreFilmRow[], seenIds: Set<string>): number {
  const items: BallotItem[] = ballot.map(film => ({
    difficulty: filmDifficulty(film),
    seen: seenIds.has(film.id),
  }));
  if (!items.some(item => item.seen)) return 0;

  return Math.round(abilityPercentile(estimateAbility(items)) * 100);
}

function titleForScore(score: number): string {
  if (score <= 10) return "Certified Normie";
  if (score <= 25) return "Casual Watcher";
  if (score <= 45) return "Film Enthusiast";
  if (score <= 65) return "Award Season Regular";
  if (score <= 80) return "Serious Cinephile";
  if (score <= 95) return "Film School Graduate";
  return "The Snob";
}

function buildBreakdown(films: ScoreFilmRow[]) {
  const byDecade: Record<string, BreakdownBucket> = {};
  const byAwardBody: Record<AwardBody, BreakdownBucket> = {
    cannes: createBreakdownBucket(),
    goldenglobe: createBreakdownBucket(),
    oscar: createBreakdownBucket(),
  };

  for (const film of films) {
    addDecadeBreakdown(byDecade, film);
    addAwardBodyBreakdown(byAwardBody, film);
  }

  return { byDecade, byAwardBody };
}

function addDecadeBreakdown(
  byDecade: Record<string, BreakdownBucket>,
  film: ScoreFilmRow,
): void {
  const decadeKey = `${film.decade}s`;
  byDecade[decadeKey] ??= createBreakdownBucket();
  byDecade[decadeKey].total += 1;
  byDecade[decadeKey].seen += 1;
}

function addAwardBodyBreakdown(
  byAwardBody: Record<AwardBody, BreakdownBucket>,
  film: ScoreFilmRow,
): void {
  for (const awardBody of film.awardBodies) {
    byAwardBody[awardBody].total += 1;
    byAwardBody[awardBody].seen += 1;
  }
}

function createBreakdownBucket(): BreakdownBucket {
  return { seen: 0, total: 0 };
}
