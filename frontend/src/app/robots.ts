import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo/absolute-url";

// Crawlers that send no visitors back. Each crawl walks thousands of
// film/person pages, and each uncached page wakes the database. Why each one:
const BLOCKED_BOTS = [
  "AhrefsBot", // Ahrefs: backlink/keyword index for SEO tools — no search traffic
  "SemrushBot", // Semrush: same, SEO tool index
  "MJ12bot", // Majestic: backlink index, crawls hard
  "DotBot", // Moz: link index for Moz Pro
  "BLEXBot", // WebMeUp: backlink index
  "DataForSeoBot", // DataForSEO: resells crawl data to SEO tools
  "PetalBot", // Huawei Petal Search: aggressive, next to no searchers in our markets
  "Bytespider", // ByteDance: AI-training crawl, known to ignore crawl limits
  "CCBot", // Common Crawl: bulk dataset (AI training), sends no visitors
];
// Not blocked on purpose: Googlebot, Bingbot and the AI assistants' search/
// answer bots (OAI-SearchBot, ChatGPT-User, PerplexityBot, ClaudeBot) — they
// can send people here or cite CineRoll as a source.

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
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
