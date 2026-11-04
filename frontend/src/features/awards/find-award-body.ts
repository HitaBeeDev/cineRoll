import { AWARD_BODIES } from "./award-bodies";

/** The award body for a URL slug, or undefined for anything else. */
export function findAwardBody(slug: string) {
  return AWARD_BODIES.find((body) => body.slug === slug);
}
