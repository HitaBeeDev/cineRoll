import { throwApiError } from "@/lib/api/api-error/throw-api-error";
import { listPath } from "./list-path";

export async function deleteUserList(listId: string): Promise<void> {
  const response = await fetch(listPath(listId), { method: "DELETE" });
  if (!response.ok && response.status !== 204) {
    await throwApiError(response, "Failed to delete list");
  }
}
