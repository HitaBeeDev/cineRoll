import { throwApiError } from "@/lib/api/api-error/throw-api-error";

export async function deleteAccount(currentPassword?: string): Promise<void> {
  const response = await fetch("/api/user/account", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ currentPassword }),
  });
  if (!response.ok && response.status !== 204) {
    await throwApiError(response, "Account not deleted");
  }
}
