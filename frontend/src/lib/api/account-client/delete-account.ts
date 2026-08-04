import { throwApiError } from "@/lib/api/api-error/throw-api-error";

export async function deleteAccount(): Promise<void> {
  const response = await fetch("/api/user/account", { method: "DELETE" });
  if (!response.ok && response.status !== 204) {
    await throwApiError(response, "Account not deleted");
  }
}
