import type { NotificationFeed } from "@/lib/api";

export type NotificationEntry = NotificationFeed["notifications"][number];

export type NotificationsSuccess = {
  status: "ok";
  entries: NotificationEntry[];
  unreadCount: number;
};

export type NotificationsResult = NotificationsSuccess | { status: "error" };
