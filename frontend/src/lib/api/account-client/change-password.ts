import { throwApiError } from "@/lib/api/api-error/throw-api-error";
import { JSON_HEADERS } from "@/lib/api/constants/json-headers";
import type { ChangePasswordInput } from "./change-password-input";

export async function changePassword(input: ChangePasswordInput): Promise<void> {
  const response = await fetch("/api/auth/change-password", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(input),
  });
  if (!response.ok) await throwApiError(response, "Something went wrong. Please try again.");
}
