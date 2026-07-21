import { cache, cacheKeys } from "../../lib/cache";
import { prisma } from "../../lib/prisma";

const DELETED_SESSION_ID = "deleted-account";

export async function deleteAccount(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  await cache.deleteByPrefix(cacheKeys.recommendationsPrefix(userId));

  await prisma.$transaction([
    prisma.event.updateMany({
      where: { userId },
      data: {
        userId: null,
        anonId: null,
        sessionId: DELETED_SESSION_ID,
        context: {},
        variant: null,
      },
    }),
    ...(user?.email
      ? [
          prisma.siteFeedback.updateMany({
            where: { email: user.email },
            data: { email: null },
          }),
        ]
      : []),
    prisma.user.deleteMany({ where: { id: userId } }),
  ]);
}
