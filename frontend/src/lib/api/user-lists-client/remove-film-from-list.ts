import { throwApiError } from "@/lib/api/api-error/throw-api-error";
import { listPath } from "./list-path";

export async function removeFilmFromList(
  listId: string,
  filmId: string,
): Promise<void> {
  const response = await fetch(
    `${listPath(listId)}/films/${encodeURIComponent(filmId)}`,
    { method: "DELETE" },
  );
  if (!response.ok && response.status !== 204) {
    await throwApiError(response, "Failed to remove from list");
  }
}
