import { absoluteUrl } from "./absolute-url";

/**
 * schema.org WebSite with a SearchAction, for the homepage only. The search
 * target is the browse page's own query string (`search` + Relevance order),
 * so a search started from Google lands on the same view as typing in the box.
 */
export function buildWebSite() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "CineRoll",
    url: absoluteUrl("/"),
    publisher: { "@id": absoluteUrl("/#organization") },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${absoluteUrl("/browse")}?search={search_term_string}&sort=relevance`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}
