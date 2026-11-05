import { Prisma } from '@prisma/client';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { buildWhereClause } from '../src/lib/filmFilters/whereClause';
import { listQuerySchema } from '../src/lib/filmFilters/listQuerySchema';
import { prisma } from '../src/lib/prisma';
import { countProviders } from '../src/routes/filmsRoute/facetCounts/facetCountQueries';

// Provider ids far outside TMDB's range, so the assertions only ever see these
// fixture rows even on a database that holds other films.
const NETFLIX = 990_001;
const MUBI = 990_002;
const provider = (id: number, name: string) => ({ id, name, logoPath: null });

const FILMS = [
  {
    id: 'itest_stream_1', slug: 'itest-stream-1', title: 'Stream One', releaseYear: 2000, genres: ['Drama'],
    watchProviders: { asOf: '2026-11-01T00:00:00.000Z', regions: [
      { country: 'DE', providers: [provider(NETFLIX, 'Netflix'), provider(MUBI, 'MUBI')] },
      { country: 'US', providers: [provider(MUBI, 'MUBI')] },
    ] },
  },
  {
    // Netflix in the US only — must not match "Netflix in Germany".
    id: 'itest_stream_2', slug: 'itest-stream-2', title: 'Stream Two', releaseYear: 2001, genres: ['Comedy'],
    watchProviders: { asOf: '2026-11-01T00:00:00.000Z', regions: [{ country: 'US', providers: [provider(NETFLIX, 'Netflix')] }] },
  },
  {
    // Seeded, never refreshed: names but no ids — invisible to the id filter.
    id: 'itest_stream_3', slug: 'itest-stream-3', title: 'Stream Three', releaseYear: 2002, genres: ['Drama'],
    watchProviders: { asOf: null, regions: [{ country: 'DE', providers: [{ id: null, name: 'Netflix', logoPath: null }] }] },
  },
];
const IDS = FILMS.map((film) => film.id);

async function matchingIds(raw: Record<string, unknown>): Promise<string[]> {
  const where = buildWhereClause(listQuerySchema.parse(raw), [Prisma.sql`"Film"."id" = ANY(${IDS})`]);
  const rows = await prisma.$queryRaw<{ id: string }[]>`SELECT "Film"."id" FROM "Film" ${where} ORDER BY "Film"."id"`;
  return rows.map((row) => row.id);
}

describe.runIf(process.env['RUN_DB_TESTS'] === '1')('streaming provider filter (integration)', () => {
  beforeAll(async () => {
    await prisma.film.deleteMany({ where: { id: { in: IDS } } });
    await prisma.film.createMany({ data: FILMS });
  });

  afterAll(async () => {
    await prisma.film.deleteMany({ where: { id: { in: IDS } } });
    await prisma.$disconnect();
  });

  it('matches provider and country inside the same region', async () => {
    expect(await matchingIds({ provider: NETFLIX, region: 'DE' })).toEqual(['itest_stream_1']);
    expect(await matchingIds({ provider: NETFLIX, region: 'US' })).toEqual(['itest_stream_2']);
  });

  it('matches the service in any country without a region', async () => {
    expect(await matchingIds({ provider: NETFLIX })).toEqual(['itest_stream_1', 'itest_stream_2']);
  });

  it('matches any of several services', async () => {
    expect(await matchingIds({ provider: `${NETFLIX},${MUBI}`, region: 'US' })).toEqual(['itest_stream_1', 'itest_stream_2']);
  });

  it('combines with the other filters', async () => {
    expect(await matchingIds({ provider: MUBI, region: 'US', genre: 'Comedy' })).toEqual([]);
    expect(await matchingIds({ provider: MUBI, region: 'US', genre: 'Drama' })).toEqual(['itest_stream_1']);
  });

  it('counts providers in the requested region, ignoring its own selection', async () => {
    const counts = (await countProviders(listQuerySchema.parse({ region: 'DE', provider: MUBI })))
      .filter((row) => [String(NETFLIX), String(MUBI)].includes(row.value));
    expect(counts).toEqual([
      { value: String(MUBI), name: 'MUBI', logoPath: null, count: 1 },
      { value: String(NETFLIX), name: 'Netflix', logoPath: null, count: 1 },
    ]);
  });

  it('streamsIn matches any service in the country, ids or not', async () => {
    expect(await matchingIds({ streamsIn: 'DE' })).toEqual(['itest_stream_1', 'itest_stream_3']);
    expect(await matchingIds({ streamsIn: 'FR' })).toEqual([]);
  });

  it('lists nothing without a region', async () => {
    expect(await countProviders(listQuerySchema.parse({}))).toEqual([]);
  });
});
