import { describe, it, expect, beforeAll, afterAll } from 'vitest';

import { prisma } from '../src/lib/prisma';
import { recommend } from '../src/lib/recommender';

// DB-backed, opt-in (see recommender.integration.test.ts). Self-contained: its own
// namespaced user + films, independent of the shared fixture, so it can assert the
// candidate-exclusion rule in isolation. Integration files run serially
// (fileParallelism: false), so there's no cross-file fixture race.
const USER_ID = 'itest_user_exc';
const EMAIL = 'itest+exc@cineroll.test';

// All Drama so they clear the recommender's top-genre pre-filter — meaning the
// ONLY reason an excluded one can be missing from the output is the exclusion set.
const WATCHED = 'itest_exc_watched';
const WATCHLIST = 'itest_exc_watchlist';
const DO_NOT_SUGGEST = 'itest_exc_dns';
const OK_1 = 'itest_exc_ok1';
const OK_2 = 'itest_exc_ok2';
const FILM_IDS = [WATCHED, WATCHLIST, DO_NOT_SUGGEST, OK_1, OK_2];

const FILMS = [
  { id: WATCHED, slug: 'itest-exc-watched', title: 'Excluded Watched', releaseYear: 1994, genres: ['Drama'], imdbRating: 8.4 },
  { id: WATCHLIST, slug: 'itest-exc-watchlist', title: 'Excluded Watchlist', releaseYear: 1996, genres: ['Drama'], imdbRating: 8.2 },
  { id: DO_NOT_SUGGEST, slug: 'itest-exc-dns', title: 'Excluded DoNotSuggest', releaseYear: 1998, genres: ['Drama'], imdbRating: 8.0 },
  { id: OK_1, slug: 'itest-exc-ok1', title: 'Candidate One', releaseYear: 2000, genres: ['Drama'], imdbRating: 7.8 },
  { id: OK_2, slug: 'itest-exc-ok2', title: 'Candidate Two', releaseYear: 2002, genres: ['Drama'], imdbRating: 7.6 },
];

async function cleanup(): Promise<void> {
  // Scoped to these ids only — never a bulk delete. Deleting the user/films
  // cascades their child rows (watched, watchlist, taste profile); Events are
  // SetNull on delete, so clear them explicitly first.
  await prisma.event.deleteMany({
    where: { OR: [{ userId: USER_ID }, { filmId: { in: FILM_IDS } }] },
  });
  await prisma.film.deleteMany({ where: { id: { in: FILM_IDS } } });
  await prisma.user.deleteMany({ where: { id: USER_ID } });
}

describe.runIf(process.env['RUN_DB_TESTS'] === '1')('recommender exclusions (integration)', () => {
  beforeAll(async () => {
    await cleanup();

    await prisma.user.create({
      data: { id: USER_ID, email: EMAIL, onboardingGenres: ['Drama'] },
    });
    await prisma.film.createMany({ data: FILMS.map((f) => ({ ...f })) });

    // One film per exclusion path.
    await prisma.watchedFilm.create({
      data: { userId: USER_ID, filmId: WATCHED, sentiment: 'like' },
    });
    await prisma.watchlist.create({
      data: { userId: USER_ID, filmId: WATCHLIST },
    });
    await prisma.watchedFilm.create({
      data: { userId: USER_ID, filmId: DO_NOT_SUGGEST, doNotSuggest: true },
    });

    // A fresh, Drama-positive profile so recommend() clears cold-start and honors
    // the stored vectors (fresh updatedAt + null staleAt → no rebuild).
    await prisma.userTasteProfile.create({
      data: { userId: USER_ID, genreWeights: { Drama: 2 }, positiveCount: 5, negativeCount: 0 },
    });
  });

  afterAll(async () => {
    await cleanup();
    await prisma.$disconnect();
  });

  it('excludes watched, watchlist, and doNotSuggest films from recommendations', async () => {
    // High limit → every eligible candidate is returned, so absence is exclusion,
    // not truncation.
    const result = await recommend(USER_ID, 50);

    if (!('recommendations' in result)) {
      throw new Error(`expected recommendations, got ${JSON.stringify(result)}`);
    }

    const ids = result.recommendations.map((r) => r.id);

    // Eligible Drama candidates come through …
    expect(ids).toContain(OK_1);
    expect(ids).toContain(OK_2);

    // … while each exclusion path is filtered out.
    expect(ids).not.toContain(WATCHED);
    expect(ids).not.toContain(WATCHLIST);
    expect(ids).not.toContain(DO_NOT_SUGGEST);
  });

  it('excluded films still exist in the catalog — they are filtered, not missing', async () => {
    const present = await prisma.film.count({
      where: { id: { in: [WATCHED, WATCHLIST, DO_NOT_SUGGEST] } },
    });
    expect(present).toBe(3);
  });
});
