import { prisma } from "./prisma";

const emptyWeights = {};

export async function markTasteProfileStale(userId: string): Promise<void> {
  const staleAt = new Date();

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
    update: {
      staleAt,
    },
  });
}
