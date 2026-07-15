import { PERSON_SITE_URL } from "./config";
import type { PersonData } from "./domain-types";

export function buildPersonJsonLd(
  person: PersonData,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: person.name,
    url: new URL(`/person/${person.slug}`, PERSON_SITE_URL).toString(),
    ...(person.photoUrl ? { image: person.photoUrl } : {}),
    ...(person.bio ? { description: person.bio } : {}),
  };
}
