import { throwApiError } from "@/lib/api/api-error/throw-api-error";
import type { NotificationFeed } from "@/lib/api/notification-types";

export async function fetchNotifications(): Promise<NotificationFeed> {
  const response = await fetch("/api/user/notifications");
  if (!response.ok) await throwApiError(response, "Failed to load notifications");
  return response.json() as Promise<NotificationFeed>;
}
