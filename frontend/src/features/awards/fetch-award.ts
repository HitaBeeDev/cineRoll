import { API_URL } from "@/lib/api/constants/api-url";

// A day: award data only changes on a seed.
const AWARD_REVALIDATE_SECONDS = 86400;

/**
 * One award payload from the backend. A 404 (unknown page, or too few films to
 * deserve one) is null so the route can 404 too. Any other failure throws, so a
 * backend outage shows the error page and is retried — never cached as a 404.
 */
export async function fetchAward<T>(path: string): Promise<T | null> {
  const response = await fetch(`${API_URL}/api/awards/${path}`, {
    next: { revalidate: AWARD_REVALIDATE_SECONDS },
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Award API ${response.status} for ${path}`);
  return (await response.json()) as T;
}
