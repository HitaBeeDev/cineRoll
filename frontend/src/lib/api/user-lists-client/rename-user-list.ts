import type { UserListMeta } from "@cineroll/types";
import { throwApiError } from "@/lib/api/api-error/throw-api-error";
import { JSON_HEADERS } from "@/lib/api/constants/json-headers";
import { listPath } from "./list-path";

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
