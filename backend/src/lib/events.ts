import type { EventType, Prisma } from "@prisma/client";
import { assignVariant } from "./experiments";
import { prisma } from "./prisma";

const PII_KEY_PATTERNS = [
  /email/i,
  /e-mail/i,
  /mailAddress/i,
  /name/i,
  /firstName/i,
  /lastName/i,
  /fullName/i,
  /displayName/i,
  /username/i,
  /userName/i,
  /phone/i,
  /address/i,
] as const;

export type LogEventInput = {
  type: EventType;
  userId?: string | null;
  anonId?: string | null;
  sessionId?: string;
  filmId?: string | null;
  context?: Prisma.InputJsonValue;
  variant?: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPiiKey(key: string): boolean {
  return PII_KEY_PATTERNS.some(pattern => pattern.test(key));
}

function sanitizeValue(value: unknown): Prisma.InputJsonValue | undefined {
  if (Array.isArray(value)) {
    return value.flatMap(item => {
      const sanitized = sanitizeValue(item);
      return sanitized === undefined ? [] : [sanitized];
    });
  }

  if (isRecord(value)) {
    return sanitizeContext(value);
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  return undefined;
}

export function sanitizeContext(context: unknown): Prisma.InputJsonObject {
  if (!isRecord(context)) return {};

  return Object.fromEntries(
    Object.entries(context)
      .filter(([key]) => !isPiiKey(key))
      .flatMap(([key, value]) => {
        const sanitized = sanitizeValue(value);
        return sanitized === undefined ? [] : [[key, sanitized]];
      }),
  );
}

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
        context: sanitizeContext(context),
        // Deterministic bucketing from the actor id unless a caller pins one.
        variant: variant ?? assignVariant(userId ?? anonId ?? null),
      },
      select: { id: true },
    });
  } catch (error) {
    console.error("Failed to log event", error);
  }
}
