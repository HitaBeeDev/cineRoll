import "server-only";
import { apiFetch } from "@/lib/apiWithAuth";
import type { NotificationFeed } from "@/lib/api";
import type { NotificationsResult } from "./domain-types";

export async function fetchNotificationsFeed(): Promise<NotificationsResult> {
  try {
    const response = await apiFetch("/api/user/notifications");
    if (!response.ok) return { status: "error" };

    const data = (await response
      .json()
      .catch(() => null)) as NotificationFeed | null;
    if (!data) return { status: "error" };

    return {
      status: "ok",
      entries: data.notifications ?? [],
      unreadCount: data.unreadCount ?? 0,
    };
  } catch {
    return { status: "error" };
  }
}
