import { describe, it, expect, beforeAll, afterAll } from 'vitest';

import { prisma } from '../src/lib/prisma';
import { recommend } from '../src/lib/recommender';

// DB-backed, opt-in (see recommender.integration.test.ts). Asserts the reason
// string anchors on a real liked film that shares the recommendation's top genre.
const USER_ID = 'itest_user_reason';
const EMAIL = 'itest+reason@cineroll.test';

const ANCHOR = 'itest_reason_anchor'; // liked (watched) Drama → supplies the anchor title
const CANDIDATE = 'itest_reason_candidate'; // unwatched Drama → should be recommended
const ANCHOR_TITLE = 'Anchor Drama Title';
const FILM_IDS = [ANCHOR, CANDIDATE];

const FILMS = [
  { id: ANCHOR, slug: 'itest-reason-anchor', title: ANCHOR_TITLE, genres: ['Drama'], releaseYear: 1994, imdbRating: 8.3 },
  { id: CANDIDATE, slug: 'itest-reason-candidate', title: 'Candidate Drama', genres: ['Drama'], releaseYear: 2001, imdbRating: 8.0 },
];

async function cleanup(): Promise<void> {
  await prisma.event.deleteMany({
    where: { OR: [{ userId: USER_ID }, { filmId: { in: FILM_IDS } }] },
  });
  await prisma.film.deleteMany({ where: { id: { in: FILM_IDS } } });
  await prisma.user.deleteMany({ where: { id: USER_ID } });
}

describe.runIf(process.env['RUN_DB_TESTS'] === '1')('recommender reason anchoring (integration)', () => {
  beforeAll(async () => {
    await cleanup();

    await prisma.user.create({ data: { id: USER_ID, email: EMAIL, onboardingGenres: ['Drama'] } });
    await prisma.film.createMany({ data: FILMS.map((f) => ({ ...f })) });

    // The liked Drama film — its title is the anchor for the Drama genre. Watched,
    // so it's excluded as a candidate but still feeds likedFilmsByGenre().
    await prisma.watchedFilm.create({
      data: { userId: USER_ID, filmId: ANCHOR, sentiment: 'like' },
    });

    // positiveCount ≥ 3 → NOT cold-start, so the reason takes the liked-anchor path
    // (cold-start reasons never reference watch history).
    await prisma.userTasteProfile.create({
      data: { userId: USER_ID, genreWeights: { Drama: 2 }, positiveCount: 5, negativeCount: 0 },
    });
  });

  afterAll(async () => {
    await cleanup();
    await prisma.$disconnect();
  });

  it('anchors the reason on a liked film sharing the top genre', async () => {
    const result = await recommend(USER_ID, 6);
    if (!('recommendations' in result)) {
      throw new Error(`expected recommendations, got ${JSON.stringify(result)}`);
    }

    expect(result.coldStart).toBe(false);

    const rec = result.recommendations.find((r) => r.id === CANDIDATE);
    expect(rec).toBeDefined();

    // "Because you liked <Anchor> and …"
    expect(rec!.reason).toContain(ANCHOR_TITLE);
    expect(rec!.reason.startsWith(`Because you liked ${ANCHOR_TITLE}`)).toBe(true);

    // The anchor itself is watched → excluded from the picks, not recommended.
    expect(result.recommendations.map((r) => r.id)).not.toContain(ANCHOR);
  });
});
