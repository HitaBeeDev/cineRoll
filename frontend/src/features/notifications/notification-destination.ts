import type { NotificationEntry } from "@/features/notifications/domain-types";

/**
 * Where a notification row goes when tapped.
 *
 * One film → straight to that film. Several → a page listing exactly those
 * films, because an arbitrary set of titles cannot be expressed as a browse
 * filter. Neither → whatever fixed `href` the announcement carries, or nowhere.
 */
export function notificationDestination(
  notification: NotificationEntry,
): string | null {
  const [first, second] = notification.filmSlugs;

  if (first !== undefined && second === undefined) return `/film/${first}`;
  if (second !== undefined) return `/profile/notifications/${notification.id}`;

  return notification.href;
}
