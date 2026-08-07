import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

// Generated rather than static so the Sitemap directive always points at the
// host being crawled — a cross-domain Sitemap line is silently ignored.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      // /api/og is exempted from the /api/ block: it serves the social preview
      // images that page metadata points at, and crawlers must be able to fetch them.
      allow: ["/", "/api/og"],
      disallow: ["/api/", "/auth/", "/profile/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
