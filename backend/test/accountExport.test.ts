import express from "express";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/lib/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    watchlist: { findMany: vi.fn() },
    watchedFilm: { findMany: vi.fn() },
    userList: { findMany: vi.fn() },
    userTasteProfile: { findUnique: vi.fn() },
  },
}));

import { prisma } from "../src/lib/prisma";
import { errorHandler } from "../src/middleware/errorHandler";
import { accountRouter } from "../src/routes/userRoute/accountRoutes";

const userFindUnique = vi.mocked(prisma.user.findUnique);
const watchlistFindMany = vi.mocked(prisma.watchlist.findMany);
const watchedFindMany = vi.mocked(prisma.watchedFilm.findMany);
const listsFindMany = vi.mocked(prisma.userList.findMany);
const tasteFindUnique = vi.mocked(prisma.userTasteProfile.findUnique);

const FILM = { slug: "the-third-man", title: "The Third Man", releaseYear: 1949, director: "Carol Reed" };

function createApp(userId: string) {
  const app = express();
  app.use((req, _res, next) => {
    Object.assign(req, { userId });
    next();
  });
  app.use("/user", accountRouter);
  app.use(errorHandler);
  return app;
}

async function exportRequest(userId = "user-123") {
  const server = createApp(userId).listen(0);
  const address = server.address();
  if (!address || typeof address === "string") {
    server.close();
    throw new Error("Failed to bind test server");
  }

  try {
    return await fetch(`http://127.0.0.1:${address.port}/user/account/export`);
  } finally {
    server.close();
  }
}

beforeEach(() => {
  userFindUnique.mockResolvedValue({
    email: "person@example.com",
    name: "Person",
    image: "avatar-1",
    emailVerified: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    onboardingGenres: ["Drama"],
  } as never);
  watchlistFindMany.mockResolvedValue([
    { addedAt: new Date("2026-02-01T00:00:00.000Z"), film: FILM },
  ] as never);
  watchedFindMany.mockResolvedValue([] as never);
  listsFindMany.mockResolvedValue([] as never);
  tasteFindUnique.mockResolvedValue(null as never);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("account export", () => {
  it("returns the account's own rows, with films identified by slug", async () => {
    const response = await exportRequest();

    expect(response.status).toBe(200);
    const body = (await response.json()) as Record<string, unknown>;

    expect(body["account"]).toMatchObject({ email: "person@example.com", name: "Person" });
    expect(body["watchlist"]).toEqual([
      { addedAt: "2026-02-01T00:00:00.000Z", film: FILM },
    ]);
    expect(body["exportedAt"]).toEqual(expect.any(String));

    // Scoped to the caller on every table — an export is the one endpoint where
    // a missing userId filter would hand over someone else's library.
    for (const query of [watchlistFindMany, watchedFindMany, listsFindMany]) {
      expect(query).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: "user-123" } }));
    }
  });

  it("rate-limits repeated exports for the same user", async () => {
    // The window allows 5; the sixth is refused. A fresh user id keeps this
    // independent of the calls the test above already spent.
    const userId = "user-rate-limited";
    for (let i = 0; i < 5; i += 1) {
      expect((await exportRequest(userId)).status).toBe(200);
    }

    const refused = await exportRequest(userId);
    expect(refused.status).toBe(429);
    expect(((await refused.json()) as { code?: string }).code).toBe("RATE_LIMITED");
  });
});
