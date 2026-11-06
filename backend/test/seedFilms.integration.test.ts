import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { prisma } from "../src/lib/prisma";
import { seedFilms, SeedAborted, type MasterFilm } from "../data/lib/seedFilms";

// seedFilms treats the table as the whole catalogue: films not in its input are
// removed. Run only against the dedicated, empty test database.
const EMAIL = "itest-seed@example.com";
const master = (over: Partial<MasterFilm> = {}): MasterFilm[] => [
  { slug: "itest-seed-a-1990", title: "Seed A", releaseYear: 1990, tmdbId: 990_101, contentType: "movie", ...over },
  { slug: "itest-seed-b-1991", title: "Seed B", releaseYear: 1991, tmdbId: 990_102, contentType: "movie" },
];

describe.runIf(process.env["RUN_DB_TESTS"] === "1")("seedFilms (integration)", () => {
  let userId: string;

  beforeAll(async () => {
    await prisma.film.deleteMany({ where: { slug: { startsWith: "itest-seed-" } } });
    await prisma.user.deleteMany({ where: { email: EMAIL } });
    userId = (await prisma.user.create({ data: { email: EMAIL } })).id;
  });

  afterAll(async () => {
    await prisma.film.deleteMany({ where: { slug: { startsWith: "itest-seed-" } } });
    await prisma.user.deleteMany({ where: { email: EMAIL } });
    await prisma.$disconnect();
  });

  it("keeps a user's watchlist entry across a reseed, a retitle and a new slug", async () => {
    await seedFilms(prisma, master());
    const a = await prisma.film.findUniqueOrThrow({ where: { slug: "itest-seed-a-1990" } });
    await prisma.watchlist.create({ data: { userId, filmId: a.id } });

    const result = await seedFilms(prisma, master({ slug: "itest-seed-a-renamed-1990", title: "Seed A (Renamed)" }));

    expect(result.failed).toEqual([]);
    expect(result.plan.renamed).toEqual([{ id: a.id, from: "itest-seed-a-1990", to: "itest-seed-a-renamed-1990" }]);
    const after = await prisma.film.findUniqueOrThrow({ where: { id: a.id } });
    expect(after).toMatchObject({ slug: "itest-seed-a-renamed-1990", title: "Seed A (Renamed)" });
    expect(await prisma.watchlist.count({ where: { userId, filmId: a.id } })).toBe(1);
  });

  const current = () => prisma.film.findMany({ where: { slug: { startsWith: "itest-seed-" } }, orderBy: { slug: "asc" } });
  // The slug film A has after the first test.
  const SLUG_A = "itest-seed-a-renamed-1990";

  it("refuses a record missing a required field before any write", async () => {
    const before = await current();
    // An UPDATE would silently skip an undefined year — it must be refused up front.
    const broken = master({ slug: SLUG_A, releaseYear: undefined, title: "Changed" });
    await expect(seedFilms(prisma, broken)).rejects.toBeInstanceOf(SeedAborted);
    expect(await current()).toEqual(before);
  });

  it("rolls back the preflight write and stops when the database rejects a film", async () => {
    const before = await current();
    // Passes the field checks, but the database refuses it — like the 5 Nov missing column.
    const broken = master({ slug: SLUG_A, title: "Changed", genres: "Drama" });
    await expect(seedFilms(prisma, broken)).rejects.toThrow(/preflight write .* failed — nothing was changed/);
    expect(await current()).toEqual(before);
  });

  it("removes only films that left master.json", async () => {
    await seedFilms(prisma, master({ slug: SLUG_A }).slice(0, 1));
    expect(await prisma.film.findUnique({ where: { slug: "itest-seed-b-1991" } })).toBeNull();
    expect(await prisma.film.findUnique({ where: { slug: SLUG_A } })).not.toBeNull();
  });
});
