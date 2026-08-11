import { prisma } from "../../lib/prisma";

// The bell panel is a short list, not an archive — older announcements fall off
// rather than paginate. Keeps the payload small enough to fetch on every mount.
const NOTIFICATION_FEED_LIMIT = 20;

type NotificationItem = {
  id: string;
  kind: string;
  title: string;
  body: string | null;
  href: string | null;
  createdAt: Date;
  unread: boolean;
};

/**
 * Notifications are global rows; only the read mark is per-user. Anything
 * announced after the user's floor is unread, where the floor is the last panel
 * open — or, for someone who has never opened it, their sign-up date. Without
 * that fallback a brand-new account would open the bell to a full backlog of
 * unread news it was never around for.
 */
export async function listNotifications(userId: string): Promise<{
  notifications: NotificationItem[];
  unreadCount: number;
}> {
  const [user, notifications] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { createdAt: true, notificationsReadAt: true },
    }),
    prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
      take: NOTIFICATION_FEED_LIMIT,
      select: {
        id: true,
        kind: true,
        title: true,
        body: true,
        href: true,
        createdAt: true,
      },
    }),
  ]);

  if (!user) {
    return { notifications: [], unreadCount: 0 };
  }

  const floor = user.notificationsReadAt ?? user.createdAt;
  const withReadState = notifications.map((notification) => ({
    ...notification,
    unread: notification.createdAt > floor,
  }));

  return {
    notifications: withReadState,
    unreadCount: withReadState.filter((notification) => notification.unread).length,
  };
}

/**
 * Marks the whole feed read. There is no per-item read state by design: the
 * panel shows everything at once, so anything finer would claim a distinction
 * the UI never makes.
 */
export async function markNotificationsRead(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { notificationsReadAt: new Date() },
  });
}
