import { createApiError } from "@/lib/api/api-error/create-api-error";
import { API_URL } from "@/lib/api/constants/api-url";
import type { RandomResult } from "../roll-types";
import { withQuery } from "../url";

export async function requestRandom(params: URLSearchParams): Promise<RandomResult> {
  const response = await fetch(withQuery(`${API_URL}/api/random`, params), {
    cache: "no-store",
  });
  if (!response.ok) throw await createApiError(response, "fetch failed");
  return response.json() as Promise<RandomResult>;
}
