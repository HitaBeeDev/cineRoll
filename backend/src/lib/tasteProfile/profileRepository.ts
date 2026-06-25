import { Prisma } from "@prisma/client";

import { prisma } from "../prisma";
import { emptyWeights } from "./emptyProfile";
import { TasteProfileVectors, Vector } from "./types";

export async function upsertStaleProfile(userId: string, staleAt: Date): Promise<void> {
  await prisma.userTasteProfile.upsert({
    where: { userId },
    create: {
      userId,
      genreWeights: emptyWeights,
      directorWeights: emptyWeights,
      decadeWeights: emptyWeights,
      runtimeBandWeights: emptyWeights,
      awardAffinity: emptyWeights,
      ratingTier: emptyWeights,
      staleAt,
      updatedAt: staleAt,
    },
    update: { staleAt },
  });
}

export async function saveTasteProfile(
  userId: string,
  profile: TasteProfileVectors,
): Promise<void> {
  const updatedAt = new Date();

  await prisma.userTasteProfile.upsert({
    where: { userId },
    create: { userId, ...profile, staleAt: null, updatedAt },
    update: { ...profile, staleAt: null, updatedAt },
  });
}

export async function findTasteProfileFreshness(userId: string) {
  return prisma.userTasteProfile.findUnique({
    where: { userId },
    select: { staleAt: true, updatedAt: true },
  });
}

export async function findTasteProfile(userId: string) {
  return prisma.userTasteProfile.findUnique({ where: { userId } });
}

export function asVector(value: Prisma.JsonValue | null | undefined): Vector {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Vector)
    : {};
}
