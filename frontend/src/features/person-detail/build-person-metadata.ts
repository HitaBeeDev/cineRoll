import type { Metadata } from "next";
import { PERSON_SITE_URL } from "./config";
import type { PersonData } from "./domain-types";
import { getPersonBioPreview } from "./person-bio";

export function buildPersonMetadata(
  person: PersonData,
  slug: string,
): Metadata {
  const title = `${person.name} — Award History | CineRoll`;
  const description = buildDescription(person);
  const pageUrl = new URL(`/person/${slug}`, PERSON_SITE_URL).toString();

  return {
    title,
    description,
    alternates: { canonical: pageUrl },
    openGraph: { title, description, url: pageUrl, type: "profile" },
    twitter: { card: "summary", title, description },
  };
}

function buildDescription(person: PersonData): string {
  const awardSummary = person.totalWins > 0
    ? `${person.totalWins} wins from ${person.totalNominations} nominations across the Oscars, Golden Globes, and Cannes.`
    : `${person.totalNominations} nominations across the Oscars, Golden Globes, and Cannes.`;
  const description = person.bio
    ? `${getPersonBioPreview(person.bio, 120)} ${awardSummary}`
    : awardSummary;
  return description.slice(0, 155);
}
