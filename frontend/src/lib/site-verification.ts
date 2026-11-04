import type { Metadata } from "next";

// Search-engine ownership tokens, emitted only on the production deploy so a
// preview or local build can never claim the cineroll.de property.
// Bing imports the site from Google Search Console, so only Google needs a token.
const token = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

export const SITE_VERIFICATION: Metadata["verification"] =
  process.env.VERCEL_ENV === "production" && token ? { google: token } : undefined;
