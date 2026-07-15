export const ROLL_BATTLE_RESULT_API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export const ROLL_BATTLE_RESULT_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://cineroll.app");

export const ROLL_BATTLE_RESULT_REVALIDATE_SECONDS = 86400;
