export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://cineroll.app");

export const IMAGE_WIDTH = 1200;

export const IMAGE_HEIGHT = 630;

export const FALLBACK_ACCENT = "#D4AF37";

export const RESPONSE_HEADERS = {
  "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
};
