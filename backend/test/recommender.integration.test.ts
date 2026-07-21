import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '../src/lib/prisma';
import { recommend } from '../src/lib/recommender';
import {
  seedFixture,
  cleanupFixture,
  FIXTURE_USER_ID,
} from './helpers/fixtures';

// DB-backed suite — opt-in only. Skipped by the default `npm test` (pure functions,
// no DB); run with `RUN_DB_TESTS=1 npm run test:integration` against a dedicated,
// empty test database. The fixture lifecycle keeps it deterministic and isolated.
describe.runIf(process.env['RUN_DB_TESTS'] === '1')('recommender (integration)', () => {
  beforeAll(async () => {
    await seedFixture();
  });

  afterAll(async () => {
    await cleanupFixture();
    await prisma.$disconnect();
  });

  it('seeds an isolated fixture with the expected signals', async () => {
    const user = await prisma.user.findUnique({ where: { id: FIXTURE_USER_ID } });
    expect(user?.email).toBe('itest+rec@cineroll.test');

    const watched = await prisma.watchedFilm.count({ where: { userId: FIXTURE_USER_ID } });
    expect(watched).toBe(2);
  });

  it('recommend() runs the DB-backed path and returns a versioned result', async () => {
    const result = await recommend(FIXTURE_USER_ID, 3);
    // Either NOT_ENOUGH_DATA or a recommendations payload — both carry modelVersion.
    expect(result.modelVersion).toBeTruthy();
  });

  it('cleanup removes every fixture row', async () => {
    await cleanupFixture();
    expect(await prisma.user.count({ where: { id: FIXTURE_USER_ID } })).toBe(0);
    expect(await prisma.film.count({ where: { id: { in: ['itest_film_1', 'itest_film_4'] } } })).toBe(0);
    // re-seed so afterAll's cleanup (and a re-run) stays consistent
    await seedFixture();
  });
});
