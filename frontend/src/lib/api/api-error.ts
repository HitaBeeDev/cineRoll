type ApiErrorBody = { code?: string; error?: string };

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

export async function throwApiError(
  response: Response,
  fallbackMessage: string,
): Promise<never> {
  throw await createApiError(response, fallbackMessage);
}
