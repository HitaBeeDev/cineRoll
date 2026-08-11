"use client";

import { useEffect } from "react";
import { markNotificationsRead } from "@/lib/api";
import { NOTIFICATIONS_READ_EVENT } from "@/features/notifications/notifications-read-event";

/**
 * Marks the feed read once the page is open. Renders nothing.
 *
 * The unread highlighting on the rows stays put for this visit — those flags
 * came from the server render and are not re-fetched, so the reader can still
 * see which items were new to them.
 */
export function MarkReadOnView({ hasUnread }: { hasUnread: boolean }) {
  useEffect(() => {
    if (!hasUnread) return;

    let active = true;
    markNotificationsRead()
      .then(() => {
        // A failed write is silent: the count simply survives to the next visit.
        if (active) window.dispatchEvent(new Event(NOTIFICATIONS_READ_EVENT));
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [hasUnread]);

  return null;
}
