import { createApiError } from "@/lib/api/api-error/create-api-error";
import { JSON_HEADERS } from "@/lib/api/constants/json-headers";

export async function removeFilmWatched(filmId: string): Promise<void> {
  const response = await fetch("/api/user/watched", {
    method: "DELETE",
    headers: JSON_HEADERS,
    body: JSON.stringify({ filmId }),
  });
  if (!response.ok && response.status !== 204) {
    throw await createApiError(response, "Failed to remove");
  }
}
