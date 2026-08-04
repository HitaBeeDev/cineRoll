import { throwApiError } from "@/lib/api/api-error/throw-api-error";
import { JSON_HEADERS } from "@/lib/api/constants/json-headers";
import { listPath } from "./list-path";

export async function addFilmToList(
  listId: string,
  filmId: string,
): Promise<void> {
  const response = await fetch(`${listPath(listId)}/films`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ filmId }),
  });
  if (!response.ok) await throwApiError(response, "Failed to add to list");
}
