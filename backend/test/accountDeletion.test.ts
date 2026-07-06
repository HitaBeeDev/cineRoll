import express from "express";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/lib/cache", () => ({
  cache: {
    deleteByPrefix: vi.fn(),
  },
  cacheKeys: {
    recommendationsPrefix: (userId: string) => `recs:${userId}:`,
  },
}));

vi.mock("../src/lib/prisma", () => ({
  prisma: {
    $transaction: vi.fn(),
    battleMatch: {
      updateMany: vi.fn(),
    },
    event: {
      updateMany: vi.fn(),
    },
    siteFeedback: {
      updateMany: vi.fn(),
    },
    user: {
      deleteMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

import { cache } from "../src/lib/cache";
import { prisma } from "../src/lib/prisma";
import { accountRouter } from "../src/routes/userRoute/accountRoutes";

const deleteByPrefix = vi.mocked(cache.deleteByPrefix);
const transaction = vi.mocked(prisma.$transaction);
const battleUpdateMany = vi.mocked(prisma.battleMatch.updateMany);
const eventUpdateMany = vi.mocked(prisma.event.updateMany);
const feedbackUpdateMany = vi.mocked(prisma.siteFeedback.updateMany);
const userDeleteMany = vi.mocked(prisma.user.deleteMany);
const userFindUnique = vi.mocked(prisma.user.findUnique);

function createApp() {
  const app = express();
  app.use((req, _res, next) => {
    Object.assign(req, { userId: "user-123" });
    next();
  });
  app.use("/user", accountRouter);
  return app;
}

async function deleteAccountRequest() {
  const server = createApp().listen(0);
  const address = server.address();
  if (!address || typeof address === "string") {
    server.close();
    throw new Error("Failed to bind test server");
  }

  try {
    return await fetch(`http://127.0.0.1:${address.port}/user/account`, {
      method: "DELETE",
    });
  } finally {
    server.close();
  }
}

beforeEach(() => {
  deleteByPrefix.mockResolvedValue(undefined);
  transaction.mockResolvedValue([]);
  eventUpdateMany.mockResolvedValue({ count: 3 });
  battleUpdateMany.mockResolvedValue({ count: 2 });
  feedbackUpdateMany.mockResolvedValue({ count: 1 });
  userDeleteMany.mockResolvedValue({ count: 1 });
  userFindUnique.mockResolvedValue({ email: "person@example.com" });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("account deletion", () => {
  it("anonymizes non-cascading rows, deletes the user, and returns 204", async () => {
    const response = await deleteAccountRequest();

    expect(response.status).toBe(204);
    expect(await response.text()).toBe("");

    expect(userFindUnique).toHaveBeenCalledWith({
      where: { id: "user-123" },
      select: { email: true },
    });
    expect(deleteByPrefix).toHaveBeenCalledWith("recs:user-123:");
    expect(eventUpdateMany).toHaveBeenCalledWith({
      where: { userId: "user-123" },
      data: {
        userId: null,
        anonId: null,
        sessionId: "deleted-account",
        context: {},
        variant: null,
      },
    });
    expect(battleUpdateMany).toHaveBeenCalledWith({
      where: { userId: "user-123" },
      data: { userId: null },
    });
    expect(feedbackUpdateMany).toHaveBeenCalledWith({
      where: { email: "person@example.com" },
      data: { email: null },
    });
    expect(userDeleteMany).toHaveBeenCalledWith({ where: { id: "user-123" } });
    expect(transaction).toHaveBeenCalledWith([
      expect.any(Promise),
      expect.any(Promise),
      expect.any(Promise),
      expect.any(Promise),
    ]);
  });

  it("still returns 204 when the account row is already gone", async () => {
    userFindUnique.mockResolvedValue(null);

    const response = await deleteAccountRequest();

    expect(response.status).toBe(204);
    expect(feedbackUpdateMany).not.toHaveBeenCalled();
    expect(transaction).toHaveBeenCalledWith([
      expect.any(Promise),
      expect.any(Promise),
      expect.any(Promise),
    ]);
  });
});
