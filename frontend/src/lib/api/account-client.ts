import { throwApiError } from "./api-error";
import { JSON_HEADERS } from "./constants";

export type ChangePasswordInput = {
  /** Omitted for OAuth-only accounts that have no existing hash to verify. */
  currentPassword?: string;
  newPassword: string;
};

export async function changePassword(input: ChangePasswordInput): Promise<void> {
  const response = await fetch("/api/auth/change-password", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(input),
  });
  if (!response.ok) await throwApiError(response, "Something went wrong. Please try again.");
}

export async function updateAvatar(avatarId: string): Promise<void> {
  const response = await fetch("/api/user/avatar", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ avatar: avatarId }),
  });
  if (!response.ok) await throwApiError(response, "Couldn't update avatar");
}

export async function deleteAccount(): Promise<void> {
  const response = await fetch("/api/user/account", { method: "DELETE" });
  if (!response.ok && response.status !== 204) {
    await throwApiError(response, "Account not deleted");
  }
}
