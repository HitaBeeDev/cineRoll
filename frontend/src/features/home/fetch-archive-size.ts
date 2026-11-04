import { API_URL } from "@/lib/api/constants/api-url";

// A day. The archive only grows on a seed; one cached API call a day keeps the
// home page from waking the backend on every visit just to print this number.
const ARCHIVE_SIZE_REVALIDATE_SECONDS = 86400;

/**
 * The catalogue size, for the home page's server render. Null on failure — the
 * client fetch still fills it in after hydration.
 */
export async function fetchArchiveSize(): Promise<number | null> {
  try {
    const response = await fetch(`${API_URL}/api/random/count`, {
      next: { revalidate: ARCHIVE_SIZE_REVALIDATE_SECONDS },
    });
    if (!response.ok) return null;
    const { total } = (await response.json()) as { total: number };
    return total;
  } catch {
    return null;
  }
}
