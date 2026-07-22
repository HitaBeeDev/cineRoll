import { prisma } from "../../lib/prisma";
import { createInitialPosteriors } from "./bandit/createInitialPosteriors";
import { LANES } from "./bandit/lanes";
import type { BetaArm, LanePosteriors } from "./bandit/types";

// DB persistence for the lane bandit (docs/smart-roll-engine.md §6b). Signed-in
// users' posteriors live here so the roll keeps learning them across devices;
// guests keep the same state client-side. The stored value is validated on read
// so a malformed row degrades to the cold-start priors rather than throwing.

export async function loadLanePosteriors(userId: string): Promise<LanePosteriors> {
  const row = await prisma.rollLaneBandit.findUnique({
    where: { userId },
    select: { posteriors: true },
  });

  return parsePosteriors(row?.posteriors) ?? createInitialPosteriors();
}

export async function persistLanePosteriors(
  userId: string,
  posteriors: LanePosteriors,
): Promise<void> {
  await prisma.rollLaneBandit.upsert({
    where: { userId },
    create: { userId, posteriors },
    update: { posteriors },
  });
}

function parsePosteriors(value: unknown): LanePosteriors | null {
  if (!value || typeof value !== "object") return null;

  const record = value as Record<string, unknown>;
  const result = createInitialPosteriors();
  for (const lane of LANES) {
    const arm = parseArm(record[lane]);
    if (!arm) return null;
    result[lane] = arm;
  }

  return result;
}

function parseArm(value: unknown): BetaArm | null {
  if (!value || typeof value !== "object") return null;

  const { alpha, beta } = value as Record<string, unknown>;
  if (typeof alpha !== "number" || typeof beta !== "number") return null;
  if (!Number.isFinite(alpha) || !Number.isFinite(beta) || alpha <= 0 || beta <= 0) return null;

  return { alpha, beta };
}
