export type NotificationFeed = {
  notifications: {
    id: string;
    /** "films_added" | "awards_updated" | "announcement" — open-ended by design. */
    kind: string;
    title: string;
    body: string | null;
    /** In-app destination, or null when the item is news with nowhere to go. */
    href: string | null;
    /** ISO string over the wire; the panel formats it for display. */
    createdAt: string;
    unread: boolean;
  }[];
  unreadCount: number;
};
