/** A person as TMDB lists them in one film's cast or crew. */
export type TmdbCreditPerson = { id: number; name: string };

/**
 * A comparison key for a person's name that ignores accents, case,
 * punctuation and word order. Award bodies and TMDB write the same person
 * differently — "Bong Joon Ho" / "Bong Joon-ho", "Pedro ALMODÓVAR" / "Pedro
 * Almodóvar", Berlin's family-name-first "SHIMIZU Hiroshi" — and all of those
 * reduce to the same set of words.
 */
export function nameKey(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/,\s*(jr|sr)\.?$/, " $1")
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .sort()
    .join(" ");
}

/**
 * The TMDB person a credited name refers to, looked up in THAT film's own
 * cast and crew — so "John Williams" on Jaws is the composer, not one of the
 * other John Williamses. Returns the id only when exactly one person in the
 * film's credits has the same name key; none or several (two credited people
 * sharing a name) is no match, and the name goes to manual review.
 */
export function matchTmdbPerson(name: string, filmCredits: readonly TmdbCreditPerson[]): number | null {
  const key = nameKey(name);
  if (!key) return null;
  const ids = new Set(filmCredits.filter(person => nameKey(person.name) === key).map(person => person.id));
  return ids.size === 1 ? [...ids][0]! : null;
}
