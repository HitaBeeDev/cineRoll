import { absoluteUrl } from "./absolute-url";
import type { PersonData } from "@/features/person-detail/domain-types";
import { getAwardBodies } from "@/features/person-detail/get-award-bodies";

/**
 * schema.org ProfilePage around the Person — the shape Google reads for
 * profile pages. `award` lists wins only (nominations aren't awards), one line
 * per win: "Academy Awards — Best Director, 1994 (Schindler's List)".
 */
export function buildPersonJsonLd(person: PersonData): Record<string, unknown> {
  const url = absoluteUrl(`/person/${person.slug}`);
  const awards = getWins(person);
  const directed = person.films.some((film) => film.role === "director");

  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url,
    mainEntity: {
      "@type": "Person",
      name: person.name,
      url,
      ...(person.photoUrl ? { image: person.photoUrl } : {}),
      ...(person.bio ? { description: person.bio } : {}),
      ...(directed ? { jobTitle: "Film director" } : {}),
      ...(awards.length > 0 ? { award: awards } : {}),
    },
  };
}

function getWins(person: PersonData): string[] {
  const wins = getAwardBodies(person).flatMap((body) =>
    body.records
      .filter((record) => record.won)
      .map((record) => `${body.label} — ${record.category}, ${record.awardYear} (${record.filmTitle})`),
  );
  return [...new Set(wins)];
}
