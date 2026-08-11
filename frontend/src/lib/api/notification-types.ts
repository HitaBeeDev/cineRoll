export type NotificationFeed = {
  notifications: {
    id: string;
    /** "films_added" | "awards_updated" | "announcement" — open-ended by design. */
    kind: string;
    title: string;
    body: string | null;
    /** Fixed in-app destination, for announcements that are not about films. */
    href: string | null;
    /**
     * The films this item is about, by slug. One → the row links straight to
     * that film; several → it links to a page listing exactly these films.
     */
    filmSlugs: string[];
    /** ISO string over the wire; the panel formats it for display. */
    createdAt: string;
    unread: boolean;
  }[];
  unreadCount: number;
};
