import { SNOB_TEST_FILM_COUNT } from "./constants";
import { AwardBody, BreakdownBucket, ScoreFilmRow } from "./types";

export function scoreSnobTest(films: ScoreFilmRow[]) {
  const total = SNOB_TEST_FILM_COUNT;
  const seen = Math.min(new Set(films.map(film => film.id)).size, total);
  const score = Math.round((seen / total) * 100);

  return {
    score,
    title: titleForScore(score),
    seen,
    total,
    breakdown: buildBreakdown(films),
  };
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
