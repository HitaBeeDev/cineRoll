import type { EventType, Prisma } from "@prisma/client";
import { prisma } from "./prisma";

export type LogEventInput = {
  type: EventType;
  userId?: string | null;
  anonId?: string | null;
  sessionId?: string;
  filmId?: string | null;
  context?: Prisma.InputJsonValue;
  variant?: string | null;
};

export async function logEvent({
  type,
  userId = null,
  anonId = null,
  sessionId = "server",
  filmId = null,
  context = {},
  variant = null,
}: LogEventInput): Promise<void> {
  try {
    await prisma.event.create({
      data: {
        userId,
        anonId,
        sessionId,
        type,
        filmId,
        context,
        variant,
      },
      select: { id: true },
    });
  } catch (error) {
    console.error("Failed to log event", error);
  }
}
