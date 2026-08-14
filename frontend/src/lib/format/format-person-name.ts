/**
 * A person's name as it should be read, not as the ceremony filed it.
 *
 * Cannes and Berlinale data capitalises surnames — "Martin SCORSESE", "Alfred
 * HITCHCOCK" — and that spelling was reaching the page heading, the tab title
 * and the award lines. Only tokens that are entirely uppercase are touched, and
 * only in a name that has a normally-cased token beside them: that is the exact
 * shape of the ceremony convention. A name that is uppercase throughout is left
 * alone, because at that point there is no way to tell a filing convention from
 * someone who spells their name that way (SZA, BALOJI).
 */
export function formatPersonName(name: string): string {
  const parts = name.split(/(\s+)/);
  if (!parts.some(isNormallyCased)) return name;

  return parts.map((part) => (isShoutedWord(part) ? toNameCase(part) : part)).join("");
}

/** A token carrying at least one lowercase letter — the anchor that says the
 *  uppercase ones beside it are a convention rather than the whole name. */
function isNormallyCased(token: string): boolean {
  return /\p{Ll}/u.test(token);
}

function isShoutedWord(token: string): boolean {
  // Two letters or more, all caps, no dots: initials ("J.R.R.") and roman
  // numerals stay as they are, and so does a lone initial.
  if (token.includes(".")) return false;
  if (!/^[\p{Lu}][\p{Lu}'’-]+$/u.test(token)) return false;

  return !/^[IVXLCDM]+$/.test(token);
}

/** Capitalise the first letter of every word part, so hyphens and apostrophes
 *  keep their own capitals: CHRISTIAN-JAQUE → Christian-Jaque, O'BRIEN → O'Brien. */
function toNameCase(token: string): string {
  const cased = token
    .toLowerCase()
    .replace(/(^|[-'’])(\p{Ll})/gu, (_, boundary: string, letter: string) => boundary + letter.toUpperCase());

  // Mc is the one prefix common enough to be worth spelling correctly; Mac is
  // left alone because it swallows real names (MACHADO is not MacHado).
  return cased.replace(/^Mc(\p{Ll})/u, (_, letter: string) => `Mc${letter.toUpperCase()}`);
}
