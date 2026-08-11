import { createApiError } from "@/lib/api/api-error/create-api-error";
import { JSON_HEADERS } from "@/lib/api/constants/json-headers";

export async function markNotificationsRead(): Promise<void> {
  const response = await fetch("/api/user/notifications/read", {
    method: "POST",
    headers: JSON_HEADERS,
  });
  if (!response.ok && response.status !== 204) {
    throw await createApiError(response, "Failed to mark notifications read");
  }
}
