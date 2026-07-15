export const PERSON_API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export const PERSON_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://cineroll.app");

export const PERSON_REVALIDATE_SECONDS = 86400;
