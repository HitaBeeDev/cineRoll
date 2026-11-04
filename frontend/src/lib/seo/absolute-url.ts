import { SITE_URL } from "@/lib/site-url";

/** A site path as a full URL on the canonical origin ("/awards" → "https://cineroll.de/awards"). */
export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
