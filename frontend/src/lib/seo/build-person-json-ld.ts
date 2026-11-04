import { absoluteUrl } from "./absolute-url";
import type { PersonData } from "@/features/person-detail/domain-types";

export function buildPersonJsonLd(
  person: PersonData,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: person.name,
    url: absoluteUrl(`/person/${person.slug}`),
    ...(person.photoUrl ? { image: person.photoUrl } : {}),
    ...(person.bio ? { description: person.bio } : {}),
  };
}
