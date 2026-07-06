import express from "express";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/lib/prisma", () => ({
  prisma: {
    event: {
      createMany: vi.fn(),
    },
    film: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("../src/middleware/auth", async () => {
  const actual = await vi.importActual<typeof import("../src/middleware/auth")>(
    "../src/middleware/auth",
  );

  return {
    ...actual,
    optionalAuth: vi.fn((req, _res, next) => {
      if (req.headers.authorization === "Bearer signed-in") {
        req.userId = "user-123";
      }
      next();
    }),
  };
});

import { prisma } from "../src/lib/prisma";
import { eventsRouter } from "../src/routes/events";

const createMany = vi.mocked(prisma.event.createMany);
const findMany = vi.mocked(prisma.film.findMany);

function createApp() {
  const app = express();
  app.use(express.json());
  app.use("/events", eventsRouter);
  return app;
}

function eventBody(overrides: Record<string, unknown> = {}) {
  return {
    anonId: "anon-123",
    sessionId: "session-123",
    type: "film_click",
    filmId: null,
    context: { source: "test" },
    consent: "granted",
    ...overrides,
  };
}

async function postEvents(events: unknown[], authorization?: string) {
  const server = createApp().listen(0);
  const address = server.address();
  if (!address || typeof address === "string") {
    server.close();
    throw new Error("Failed to bind test server");
  }

  try {
    return await fetch(`http://127.0.0.1:${address.port}/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authorization ? { authorization } : {}),
      },
      body: JSON.stringify(events),
    });
  } finally {
    server.close();
  }
}

beforeEach(() => {
  createMany.mockResolvedValue({ count: 1 });
  findMany.mockResolvedValue([]);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("events route attribution", () => {
  it("stores anonymous events with anonId and no userId", async () => {
    const response = await postEvents([eventBody()]);

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ count: 1, dropped: 0 });
    expect(createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          userId: null,
          anonId: "anon-123",
          sessionId: "session-123",
          type: "film_click",
        }),
      ],
    });
  });

  it("attributes signed-in events to the authenticated user while preserving anonId", async () => {
    const response = await postEvents(
      [eventBody({ anonId: "anon-before-sign-in", type: "search" })],
      "Bearer signed-in",
    );

    expect(response.status).toBe(201);
    expect(createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          userId: "user-123",
          anonId: "anon-before-sign-in",
          sessionId: "session-123",
          type: "search",
        }),
      ],
    });
  });
});
