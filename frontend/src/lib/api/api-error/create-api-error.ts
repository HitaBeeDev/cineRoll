import type { ApiErrorBody } from "./api-error-body";

export async function createApiError(
  response: Response,
  fallbackMessage: string,
): Promise<Error> {
  const body = (await response.json().catch(() => ({}))) as ApiErrorBody;
  return Object.assign(new Error(body.error ?? fallbackMessage), {
    code: body.code ?? "UNKNOWN",
    status: response.status,
  });
}
