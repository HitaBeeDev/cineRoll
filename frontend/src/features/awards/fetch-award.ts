import { API_URL } from "@/lib/api/constants/api-url";

// A day: award data only changes on a seed.
const AWARD_REVALIDATE_SECONDS = 86400;

/**
 * One award payload from the backend. A 404 (unknown page, or too few films to
 * deserve one) or a 400 (malformed path) is null so the route can 404 too. Any other failure throws, so a
 * backend outage shows the error page and is retried — never cached as a 404.
 */
export async function fetchAward<T>(path: string): Promise<T | null> {
  const response = await fetch(`${API_URL}/api/awards/${path}`, {
    next: { revalidate: AWARD_REVALIDATE_SECONDS },
  });
  // 400 is the backend refusing the path itself (a year like 1801 fails its
  // range check) — for a URL that is "no such page", not a server fault, so
  // it must 404 rather than throw into a 500.
  if (response.status === 404 || response.status === 400) return null;
  if (!response.ok) throw new Error(`Award API ${response.status} for ${path}`);
  return (await response.json()) as T;
}
