import { throwApiError } from "@/lib/api/api-error/throw-api-error";
import type { UserListsResponse } from "../user-list-types";
import { LISTS_PATH } from "./lists-path";

export async function fetchUserLists(
  filmId?: string,
): Promise<UserListsResponse> {
  const query = filmId ? `?filmId=${encodeURIComponent(filmId)}` : "";
  const response = await fetch(`${LISTS_PATH}${query}`);
  if (!response.ok) await throwApiError(response, "Failed to load lists");
  return response.json() as Promise<UserListsResponse>;
}
