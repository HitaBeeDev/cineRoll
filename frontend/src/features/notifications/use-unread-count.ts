"use client";

import { useEffect, useState } from "react";
import { fetchNotifications } from "@/lib/api";
import { NOTIFICATIONS_READ_EVENT } from "@/features/notifications/notifications-read-event";

/**
 * Unread badge for the account menu's What's new row.
 *
 * One fetch per mount, no polling: site news lands on a seed run, not by the
 * minute, so a poll would be a request every signed-in user pays for to learn
 * nothing. Zero on failure — a count is decoration here, and a menu row that
 * says "couldn't load" would be worse than one that says nothing.
 */
export function useUnreadCount(enabled: boolean): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    let active = true;
    fetchNotifications()
      .then((feed) => {
        if (active) setCount(feed.unreadCount);
      })
      .catch(() => {});

    function handleRead() {
      setCount(0);
    }

    window.addEventListener(NOTIFICATIONS_READ_EVENT, handleRead);
    return () => {
      active = false;
      window.removeEventListener(NOTIFICATIONS_READ_EVENT, handleRead);
    };
  }, [enabled]);

  return count;
}
