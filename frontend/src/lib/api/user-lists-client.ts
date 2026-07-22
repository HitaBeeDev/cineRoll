import type { UserListMeta } from "@cineroll/types";
import { throwApiError } from "./api-error";
import { JSON_HEADERS } from "./constants";
import type { UserListsResponse } from "./user-list-types";

const LISTS_PATH = "/api/user/lists";

export async function fetchUserLists(
  filmId?: string,
): Promise<UserListsResponse> {
  const query = filmId ? `?filmId=${encodeURIComponent(filmId)}` : "";
  const response = await fetch(`${LISTS_PATH}${query}`);
  if (!response.ok) await throwApiError(response, "Failed to load lists");
  return response.json() as Promise<UserListsResponse>;
}

export async function createUserList(name: string): Promise<UserListMeta> {
  const response = await fetch(LISTS_PATH, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ name }),
  });
  if (!response.ok) await throwApiError(response, "Failed to create list");
  return response.json() as Promise<UserListMeta>;
}

export async function renameUserList(
  listId: string,
  name: string,
): Promise<UserListMeta> {
  const response = await fetch(listPath(listId), {
    method: "PATCH",
    headers: JSON_HEADERS,
    body: JSON.stringify({ name }),
  });
  if (!response.ok) await throwApiError(response, "Failed to rename list");
  return response.json() as Promise<UserListMeta>;
}

export async function deleteUserList(listId: string): Promise<void> {
  const response = await fetch(listPath(listId), { method: "DELETE" });
  if (!response.ok && response.status !== 204) {
    await throwApiError(response, "Failed to delete list");
  }
}

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

function listPath(listId: string): string {
  return `${LISTS_PATH}/${encodeURIComponent(listId)}`;
}
