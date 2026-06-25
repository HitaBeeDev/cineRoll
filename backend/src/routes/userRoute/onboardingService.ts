import { prisma } from "../../lib/prisma";
import { staleTasteProfile } from "./taste";

export async function saveOnboardingGenres(userId: string, genres: string[]): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { onboardingGenres: genres },
  });

  await staleTasteProfile(userId);
}
