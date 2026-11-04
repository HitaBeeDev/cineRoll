import { nameToSlug } from "./slug";

/**
 * The award-data spelling of the person a slug points at, or null.
 *
 * A slug drops accents and punctuation ("Pedro Almodóvar" → "pedro-almodovar"),
 * so it cannot be turned back into the name on its own. The Person table stores
 * slug and exact name side by side, so its name wins. Without a row, fall back
 * to the candidate names found by the dashes-as-spaces lookup, which only
 * covers plain names like "Federico Fellini".
 */
export function pickCanonicalName(
  slug: string,
  storedName: string | null,
  candidates: string[],
): string | null {
  if (storedName && nameToSlug(storedName) === slug) return storedName;
  return candidates.find(name => nameToSlug(name) === slug) ?? null;
}
