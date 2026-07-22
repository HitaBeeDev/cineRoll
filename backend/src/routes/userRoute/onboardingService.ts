import { prisma } from "../../lib/prisma";
import { markTasteProfileStale } from "../../lib/tasteProfile";

export async function saveOnboardingGenres(userId: string, genres: string[]): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { onboardingGenres: genres },
  });

  await markTasteProfileStale(userId);
}
