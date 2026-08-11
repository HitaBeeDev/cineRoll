import { prisma } from "../../lib/prisma";
import { withYear } from "./filmMapper";
import { filmSummarySelect } from "./selects";

// The bell panel is a short list, not an archive — older announcements fall off
// rather than paginate. Keeps the payload small enough to fetch on every mount.
const NOTIFICATION_FEED_LIMIT = 20;

type NotificationItem = {
  id: string;
  kind: string;
  title: string;
  body: string | null;
  href: string | null;
  filmSlugs: string[];
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
        filmSlugs: true,
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

/**
 * One announcement and the films it is about, for the group page.
 *
 * Films are looked up by slug and re-sorted into the order the announcement
 * stored them; `findMany` returns them in whatever order Postgres likes, and a
 * seed announces films in catalogue order. Slugs with no matching film are
 * dropped silently — a later seed can retire a title, and a missing poster is
 * not worth failing the page over.
 */
export async function getNotificationFilms(notificationId: string) {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
    select: { id: true, title: true, body: true, filmSlugs: true, createdAt: true },
  });

  if (!notification) return null;

  const films = await prisma.film.findMany({
    where: { slug: { in: notification.filmSlugs } },
    select: filmSummarySelect,
  });

  const bySlug = new Map(films.map((film) => [film.slug, film]));

  return {
    notification,
    films: notification.filmSlugs
      .map((slug) => bySlug.get(slug))
      .filter((film) => film !== undefined)
      .map(withYear),
  };
}
