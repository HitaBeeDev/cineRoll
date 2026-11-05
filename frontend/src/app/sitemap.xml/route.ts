import { absoluteUrl } from "@/lib/seo/absolute-url";

// The sitemap index at the URL already submitted to Search Console and Bing.
// Each page family has its own child sitemap, so new families (award years,
// collections) are one line here and none of them nears the 50k-URL limit.
const CHILD_SITEMAPS = ["pages", "films", "persons", "awards", "streaming"];

export function GET() {
  const entries = CHILD_SITEMAPS.map(
    (name) => `  <sitemap><loc>${absoluteUrl(`/sitemaps/${name}/sitemap.xml`)}</loc></sitemap>`,
  ).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</sitemapindex>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
