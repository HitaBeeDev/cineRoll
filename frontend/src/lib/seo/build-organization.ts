import { absoluteUrl } from "./absolute-url";
import { SITE_DESCRIPTION } from "./site-description";

// CineRoll's own profiles elsewhere. Add new socials here — nowhere else.
const SAME_AS = [
  "https://github.com/HitaBeeDev/cineRoll",
  "https://ko-fi.com/hitabeedev",
];

/**
 * schema.org Organization for the homepage. The fixed `@id` lets other blocks
 * (WebSite.publisher) point at this one instead of repeating it.
 */
export function buildOrganization() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": absoluteUrl("/#organization"),
    name: "CineRoll",
    description: SITE_DESCRIPTION,
    url: absoluteUrl("/"),
    logo: absoluteUrl("/icon-512.png"),
    sameAs: SAME_AS,
    founder: {
      "@type": "Person",
      name: "Anahita Amiri",
      sameAs: ["https://github.com/HitaBeeDev", "https://anahita-amiri.dev"],
    },
  };
}
