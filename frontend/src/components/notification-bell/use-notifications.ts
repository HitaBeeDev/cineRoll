"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchNotifications, markNotificationsRead } from "@/lib/api";
import type { NotificationFeed } from "@/lib/api";

type NotificationItem = NotificationFeed["notifications"][number];

export type NotificationsController = {
  open: boolean;
  items: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  failed: boolean;
  toggle: () => void;
  close: () => void;
};

/**
 * Feed state for the header bell.
 *
 * Fetched once per mount rather than polled: site news lands on a seed run, not
 * by the minute, so a poll would be a request every user pays for to learn
 * nothing. Opening the panel marks the whole feed read on the server, but the
 * per-item `unread` flags are kept as-is until the next load — otherwise the
 * highlighting would vanish under the reader's eyes as they open it.
 *
 * `panelRef` is owned by the caller (it also attaches it to the DOM); the hook
 * only reads it inside the outside-click listener.
 */
export function useNotifications(
  enabled: boolean,
  panelRef: React.RefObject<HTMLDivElement | null>,
): NotificationsController {
  const [open, setOpen] = useState(false);
  const [feed, setFeed] = useState<NotificationFeed | null>(null);
  const [failed, setFailed] = useState(false);
  // Read is posted once per mount; re-opening the panel should not re-hit it.
  const readPosted = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    let active = true;
    fetchNotifications()
      .then((next) => {
        if (!active) return;
        setFeed(next);
        setFailed(false);
      })
      .catch(() => {
        if (active) setFailed(true);
      });

    return () => {
      active = false;
    };
  }, [enabled]);

  const close = useCallback(() => setOpen(false), []);

  const toggle = useCallback(() => {
    setOpen((wasOpen) => {
      // Clear the badge the moment it is opened. A failed write is not worth
      // surfacing — the badge simply comes back on the next load.
      if (!wasOpen && !readPosted.current) {
        readPosted.current = true;
        void markNotificationsRead().catch(() => {
          readPosted.current = false;
        });
        setFeed((current) => (current ? { ...current, unreadCount: 0 } : current));
      }
      return !wasOpen;
    });
  }, []);

  useEffect(() => {
    if (!open) return;

    function handlePointer(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, panelRef]);

  return {
    open,
    items: feed?.notifications ?? [],
    unreadCount: feed?.unreadCount ?? 0,
    // Derived rather than stored, so the effect never has to setState up front.
    loading: enabled && feed === null && !failed,
    failed,
    toggle,
    close,
  };
}
