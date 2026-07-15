export const FILM_REVALIDATE_SECONDS = 3600;
export const FALLBACK_FILM_ACCENT = "#D4AF37";
export const HERO_AWARD_GOLD = "#D4AF37";

export const FILM_API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://cineroll.app");
