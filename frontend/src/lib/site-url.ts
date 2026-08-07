// The canonical public origin, used for canonical URLs, JSON-LD, sitemaps,
// robots and share links. Preview deploys fall back to their own VERCEL_URL so
// a preview never advertises production URLs; local dev falls back to the
// production domain so metadata stays inspectable.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://cineroll.de");
