import type { UserListMeta } from "@cineroll/types";
import { throwApiError } from "@/lib/api/api-error/throw-api-error";
import { JSON_HEADERS } from "@/lib/api/constants/json-headers";
import { LISTS_PATH } from "./lists-path";

export async function createUserList(name: string): Promise<UserListMeta> {
  const response = await fetch(LISTS_PATH, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ name }),
  });
  if (!response.ok) await throwApiError(response, "Failed to create list");
  return response.json() as Promise<UserListMeta>;
}
