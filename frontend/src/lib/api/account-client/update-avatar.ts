import { throwApiError } from "@/lib/api/api-error/throw-api-error";
import { JSON_HEADERS } from "@/lib/api/constants/json-headers";

export async function updateAvatar(avatarId: string): Promise<void> {
  const response = await fetch("/api/user/avatar", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ avatar: avatarId }),
  });
  if (!response.ok) await throwApiError(response, "Couldn't update avatar");
}
