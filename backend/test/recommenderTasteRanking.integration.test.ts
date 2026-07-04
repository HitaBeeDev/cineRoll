import { describe, it, expect, beforeAll, afterAll } from 'vitest';

import { prisma } from '../src/lib/prisma';
import { recommend } from '../src/lib/recommender';

// DB-backed, opt-in (see recommender.integration.test.ts). Asserts that a user's
// stored taste — liked genres and directors — actually shapes the ranking.
const USER_ID = 'itest_user_rank';
const EMAIL = 'itest+rank@cineroll.test';

const LIKED_MATCH = 'itest_rank_match'; // liked genre (Drama) + liked director (Nolan)
const GENRE_ONLY = 'itest_rank_genre'; // liked genre, unliked director
const LOWER_GENRE = 'itest_rank_lower'; // lesser-weighted liked genre (Thriller)
const UNLIKED_GENRE = 'itest_rank_unliked'; // genre not in the taste profile at all
const FILM_IDS = [LIKED_MATCH, GENRE_ONLY, LOWER_GENRE, UNLIKED_GENRE];

// Identical rating/year across all four → the quality-prior and recency-prior
// contributions are equal, so any score difference is purely the taste signal.
const RATING = { imdbRating: 7.5, rtScore: 80 } as const;
const YEAR = 2010;

const FILMS = [
  { id: LIKED_MATCH, slug: 'itest-rank-match', title: 'Drama by Nolan', genres: ['Drama'], director: 'Nolan', releaseYear: YEAR, ...RATING },
  { id: GENRE_ONLY, slug: 'itest-rank-genre', title: 'Drama by Villeneuve', genres: ['Drama'], director: 'Villeneuve', releaseYear: YEAR, ...RATING },
  { id: LOWER_GENRE, slug: 'itest-rank-lower', title: 'Thriller by Villeneuve', genres: ['Thriller'], director: 'Villeneuve', releaseYear: YEAR, ...RATING },
  { id: UNLIKED_GENRE, slug: 'itest-rank-unliked', title: 'Horror by Villeneuve', genres: ['Horror'], director: 'Villeneuve', releaseYear: YEAR, ...RATING },
];

async function cleanup(): Promise<void> {
  await prisma.event.deleteMany({
    where: { OR: [{ userId: USER_ID }, { filmId: { in: FILM_IDS } }] },
  });
  await prisma.film.deleteMany({ where: { id: { in: FILM_IDS } } });
  await prisma.user.deleteMany({ where: { id: USER_ID } });
}

describe.runIf(process.env['RUN_DB_TESTS'] === '1')('recommender taste ranking (integration)', () => {
  beforeAll(async () => {
    await cleanup();

    await prisma.user.create({ data: { id: USER_ID, email: EMAIL, onboardingGenres: ['Drama'] } });
    await prisma.film.createMany({ data: FILMS.map((f) => ({ ...f })) });

    // Drama strongly liked, Thriller mildly liked, Nolan the liked director.
    await prisma.userTasteProfile.create({
      data: {
        userId: USER_ID,
        genreWeights: { Drama: 2, Thriller: 1 },
        directorWeights: { Nolan: 1 },
        positiveCount: 5,
        negativeCount: 0,
      },
    });
  });

  afterAll(async () => {
    await cleanup();
    await prisma.$disconnect();
  });

  it('reflects the user\'s liked genres and directors in the ranking', async () => {
    const result = await recommend(USER_ID, 50);
    if (!('recommendations' in result)) {
      throw new Error(`expected recommendations, got ${JSON.stringify(result)}`);
    }

    const recs = result.recommendations;
    const ids = recs.map((r) => r.id);

    // A film in a liked genre by a liked director ranks first.
    expect(recs[0]!.id).toBe(LIKED_MATCH);

    // Only films in liked genres are candidates; the unliked-genre film is gone.
    expect(ids).toContain(LIKED_MATCH);
    expect(ids).toContain(GENRE_ONLY);
    expect(ids).toContain(LOWER_GENRE);
    expect(ids).not.toContain(UNLIKED_GENRE);

    const score = (id: string) => recs.find((r) => r.id === id)!.score;

    // Same genre → the liked director lifts the score.
    expect(score(LIKED_MATCH)).toBeGreaterThan(score(GENRE_ONLY));
    // Higher-weighted liked genre outscores the lesser-weighted one.
    expect(score(GENRE_ONLY)).toBeGreaterThan(score(LOWER_GENRE));
  });
});
