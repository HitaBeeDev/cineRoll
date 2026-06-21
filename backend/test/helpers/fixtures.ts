/**
 * Integration-test fixtures — a small, deterministic user + film set.
 *
 * Why seed-and-clean rather than a per-test transaction rollback: the code under
 * test uses the global `prisma` singleton (src/lib/prisma.ts), so it would never
 * share a test-scoped transaction client — a rollback wrapper couldn't undo its
 * writes. Instead we insert a handful of **namespaced** rows (ids/slugs/email all
 * prefixed `itest_`) and delete exactly those afterwards. Cleanup is scoped to the
 * fixture ids — it never bulk-deletes — so it's safe even if pointed at a populated
 * database, though integration assertions are only deterministic against a
 * dedicated, otherwise-empty test database (the recommender pools over all films).
 *
 * Safety: seeding requires `RUN_DB_TESTS=1` and a `DATABASE_URL` pointed at a test
 * database — never the production Neon URL.
 */
import { prisma } from '../../src/lib/prisma';

export const FIXTURE_USER_ID = 'itest_user_rec';
export const FIXTURE_EMAIL = 'itest+rec@cineroll.test';

/** Deterministic film set: three Drama-leaning titles + one Action outlier, so a
 *  Drama taste signal has something to both prefer and reject. */
export const FIXTURE_FILMS = [
  { id: 'itest_film_1', slug: 'itest-film-1', title: 'Test Drama One',   releaseYear: 1994, genres: ['Drama'],            imdbRating: 8.0 },
  { id: 'itest_film_2', slug: 'itest-film-2', title: 'Test Drama Two',   releaseYear: 1998, genres: ['Drama', 'Romance'], imdbRating: 7.8 },
  { id: 'itest_film_3', slug: 'itest-film-3', title: 'Test Drama Three', releaseYear: 2001, genres: ['Drama'],            imdbRating: 7.5 },
  { id: 'itest_film_4', slug: 'itest-film-4', title: 'Test Action One',  releaseYear: 2010, genres: ['Action'],           imdbRating: 6.0 },
] as const;

export const FIXTURE_FILM_IDS = FIXTURE_FILMS.map((f) => f.id);

export interface SeededFixture {
  userId: string;
  filmIds: string[];
}

function assertTestEnv(): void {
  if (process.env['RUN_DB_TESTS'] !== '1') {
    throw new Error(
      'DB fixtures refused: set RUN_DB_TESTS=1 and point DATABASE_URL at a test database before seeding.',
    );
  }
}

/**
 * Remove every fixture row. Scoped to the fixture ids only (never a bulk delete).
 * Films/User cascade to their child rows (watchlist, watched, ratings, comments,
 * taste profile); Event rows are SetNull on delete, so we clear them explicitly.
 * Idempotent — safe to call before seeding and in afterAll/afterEach.
 */
export async function cleanupFixture(): Promise<void> {
  await prisma.event.deleteMany({
    where: { OR: [{ userId: FIXTURE_USER_ID }, { filmId: { in: FIXTURE_FILM_IDS } }] },
  });
  await prisma.film.deleteMany({ where: { id: { in: FIXTURE_FILM_IDS } } });
  await prisma.user.deleteMany({ where: { id: FIXTURE_USER_ID } });
}

/**
 * Seed a clean fixture: the test user, the film set, a couple of "liked" signals
 * (watched + high rating on the Drama titles), and a matching taste profile so
 * `recommend()` has a real Drama genre signal. Returns the created ids.
 */
export async function seedFixture(): Promise<SeededFixture> {
  assertTestEnv();
  await cleanupFixture();

  await prisma.user.create({
    data: { id: FIXTURE_USER_ID, email: FIXTURE_EMAIL, onboardingGenres: ['Drama'] },
  });

  await prisma.film.createMany({ data: FIXTURE_FILMS.map((f) => ({ ...f })) });

  // Liked signals on the two top Drama films.
  await prisma.watchedFilm.createMany({
    data: [
      { userId: FIXTURE_USER_ID, filmId: 'itest_film_1', sentiment: 'like' },
      { userId: FIXTURE_USER_ID, filmId: 'itest_film_2', sentiment: 'like' },
    ],
  });
  await prisma.userRating.createMany({
    data: [
      { userId: FIXTURE_USER_ID, filmId: 'itest_film_1', rating: 9 },
      { userId: FIXTURE_USER_ID, filmId: 'itest_film_2', rating: 8.5 },
    ],
  });

  // A coherent taste profile (Drama-positive) so recommend() clears cold-start.
  await prisma.userTasteProfile.create({
    data: {
      userId: FIXTURE_USER_ID,
      genreWeights: { Drama: 2 },
      positiveCount: 5,
      negativeCount: 0,
    },
  });

  return { userId: FIXTURE_USER_ID, filmIds: [...FIXTURE_FILM_IDS] };
}
