import type { TimedResponse } from "./types";

export async function timeRequest(
  url: string,
  headers: Record<string, string>,
): Promise<TimedResponse> {
  const start = performance.now();

  try {
    const response = await fetch(url, { headers });
    await response.arrayBuffer();
    return { ms: performance.now() - start, ok: response.ok };
  } catch {
    return { ms: performance.now() - start, ok: false };
  }
}
