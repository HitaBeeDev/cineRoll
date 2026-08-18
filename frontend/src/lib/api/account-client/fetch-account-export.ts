import { throwApiError } from "@/lib/api/api-error/throw-api-error";

/** The signed-in account's data, as the JSON document the download saves. */
export async function fetchAccountExport(): Promise<unknown> {
  const response = await fetch("/api/user/account/export");
  if (!response.ok) await throwApiError(response, "Export not ready. Please try again.");
  return response.json();
}
