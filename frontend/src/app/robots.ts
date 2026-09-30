import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

// SEO scrapers and bulk crawlers that send no visitors back. Each crawl walks
// thousands of film/person pages, and each uncached page wakes the database.
const BLOCKED_BOTS = [
  "AhrefsBot",
  "SemrushBot",
  "MJ12bot",
  "DotBot",
  "BLEXBot",
  "DataForSeoBot",
  "PetalBot",
  "Bytespider",
  "CCBot",
];

// Generated rather than static so the Sitemap directive always points at the
// host being crawled — a cross-domain Sitemap line is silently ignored.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        // /api/og is exempted from the /api/ block: it serves the social preview
        // images that page metadata points at, and crawlers must be able to fetch them.
        allow: ["/", "/api/og"],
        disallow: ["/api/", "/auth/", "/profile/"],
      },
      { userAgent: BLOCKED_BOTS, disallow: "/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
