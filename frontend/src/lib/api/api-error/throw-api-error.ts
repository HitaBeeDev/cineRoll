import { createApiError } from "./create-api-error";

export async function throwApiError(
  response: Response,
  fallbackMessage: string,
): Promise<never> {
  throw await createApiError(response, fallbackMessage);
}
