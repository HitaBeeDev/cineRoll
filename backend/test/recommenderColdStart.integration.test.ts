import { describe, it, expect, beforeAll, afterAll } from 'vitest';

import { prisma } from '../src/lib/prisma';
import { recommend } from '../src/lib/recommender';

// DB-backed, opt-in (see recommender.integration.test.ts). Exercises the two
// cold-start branches through the real taste-profile build pipeline: no profile
// row is pre-seeded, so getTasteProfile() rebuilds from signals + onboarding.
const USER_SEEDED = 'itest_user_cs_seed'; // 0 signals, onboarding = ['Drama']
const USER_EMPTY = 'itest_user_cs_empty'; // 0 signals, no onboarding
const FILM_1 = 'itest_cs_film1';
const FILM_2 = 'itest_cs_film2';
const FILM_IDS = [FILM_1, FILM_2];
const USER_IDS = [USER_SEEDED, USER_EMPTY];

const FILMS = [
  { id: FILM_1, slug: 'itest-cs-film1', title: 'Cold Drama One', genres: ['Drama'], releaseYear: 1999, imdbRating: 8.1 },
  { id: FILM_2, slug: 'itest-cs-film2', title: 'Cold Drama Two', genres: ['Drama'], releaseYear: 2004, imdbRating: 7.9 },
];

async function cleanup(): Promise<void> {
  await prisma.event.deleteMany({
    where: { OR: [{ userId: { in: USER_IDS } }, { filmId: { in: FILM_IDS } }] },
  });
  await prisma.film.deleteMany({ where: { id: { in: FILM_IDS } } });
  await prisma.user.deleteMany({ where: { id: { in: USER_IDS } } });
}

describe.runIf(process.env['RUN_DB_TESTS'] === '1')('recommender cold-start (integration)', () => {
  beforeAll(async () => {
    await cleanup();

    await prisma.film.createMany({ data: FILMS.map((f) => ({ ...f })) });
    // Both users have zero signals; the ONLY difference is the onboarding seed.
    await prisma.user.create({
      data: { id: USER_SEEDED, email: 'itest+cs-seed@cineroll.test', onboardingGenres: ['Drama'] },
    });
    await prisma.user.create({
      data: { id: USER_EMPTY, email: 'itest+cs-empty@cineroll.test', onboardingGenres: [] },
    });
  });

  afterAll(async () => {
    await cleanup();
    await prisma.$disconnect();
  });

  it('under the signal threshold with an onboarding seed → coldStart picks', async () => {
    const result = await recommend(USER_SEEDED, 6);
    if (!('recommendations' in result)) {
      throw new Error(`expected coldStart picks, got ${JSON.stringify(result)}`);
    }

    expect(result.coldStart).toBe(true);
    // The onboarding Drama seed produces a real genre signal, so picks are made.
    expect(result.recommendations.length).toBeGreaterThan(0);
    for (const rec of result.recommendations) expect(rec.genres).toContain('Drama');
  });

  it('zero signals and no onboarding seed → NOT_ENOUGH_DATA', async () => {
    const result = await recommend(USER_EMPTY, 6);
    expect(result).toMatchObject({ code: 'NOT_ENOUGH_DATA' });
    expect('recommendations' in result).toBe(false);
  });
});
