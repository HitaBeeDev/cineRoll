import { createApiError } from "@/lib/api/api-error/create-api-error";
import { JSON_HEADERS } from "@/lib/api/constants/json-headers";

export async function mutateWatchlist(
  method: "POST" | "DELETE",
  filmId: string,
  errorMessage: string,
): Promise<void> {
  const response = await fetch("/api/user/watchlist", {
    method,
    headers: JSON_HEADERS,
    body: JSON.stringify({ filmId }),
  });
  if (!response.ok) throw await createApiError(response, errorMessage);
}
