/**
 * Award data stores a credit LINE, not a person: "Stanley Kubrick, Producer",
 * "Stanley Kubrick, Arthur C. Clarke", "Art Direction: Cedric Gibbons; Set
 * Decoration: Edwin B. Willis". Grouping those raw strings put five
 * near-identical Stanley Kubricks in the search dropdown, so every credit line
 * is split into the people it names and everything that is not a person —
 * roles, studios, departments, song titles — is dropped.
 *
 * Deliberately conservative: a segment has to look like a person's name to
 * survive. Missing a rare credit is cheaper than offering "Sound Director" as
 * someone you can search for.
 */
export const splitCreditNames = (raw: string): string[] => {
  const segments = toSegments(raw);
  if (segments.length === 0) return [];

  const names: string[] = [];
  for (const segment of segments) {
    // "Fred Niblo, Jr." split into two segments — the suffix belongs to the
    // name before it, not to a second person.
    if (NAME_SUFFIX.test(segment)) {
      const previous = names.pop();
      if (previous) names.push(`${previous}, ${segment}`);
      continue;
    }

    if (isPerson(segment, segments.length === 1)) names.push(segment);
  }

  return names;
};

const toSegments = (raw: string): string[] => {
  const trimmed = raw?.trim() ?? "";
  // Quotes mean a song or film title is being credited, not a person
  // ('"Blame Canada" from "South Park" Music by …').
  if (!trimmed || trimmed === "NaN" || trimmed.includes('"')) return [];

  return trimmed
    .replace(PARENTHETICAL_NOTE, " ")
    .replace(/[()[\]]/g, " ")
    .split(/[;/]/)
    // "Art Direction: Cedric Gibbons" — the label before the colon is the
    // craft, the people come after it.
    .flatMap(clause => clause.slice(clause.lastIndexOf(":") + 1).split(","))
    // A company is dropped whole rather than split: "Charles Guggenheim &
    // Associates" must not leave "Australian News" behind when the same rule
    // meets "Australian News & Information Bureau".
    .flatMap(part => (ORGANISATION.test(part) ? [] : part.split(/ and | & /i)))
    // "Written by Joel Coen", "Screenplay by Quentin Tarantino" — the credit
    // verb is not part of the name, and leaving it on split one person into
    // four dropdown rows.
    .map(piece => piece.replace(/^.*\bby\s+/i, "").replace(/\s+/g, " ").trim())
    .filter(piece => piece.length > 0);
};

/**
 * `soleSegment` relaxes the two-word rule for a credit line that names one
 * thing and nothing else, so mononyms ("Cher") survive while the halves of
 * "Robe, The" — a film title parked in the nominee field — do not.
 */
const isPerson = (segment: string, soleSegment: boolean): boolean => {
  if (segment.length < 2) return false;
  if (!STARTS_LIKE_A_NAME.test(segment)) return false;
  if (/\d/.test(segment)) return false;
  if (STOP_WORD.test(segment)) return false;
  if (ROLE.test(segment)) return false;
  if (ORGANISATION.test(segment)) return false;

  return soleSegment || segment.includes(" ");
};

// Notes rather than names: "(Thematic Music by Victor Schertzinger)".
const PARENTHETICAL_NOTE = /\([^)]*\b(by|music|score|lyrics?|from|thematic|head)\b[^)]*\)/gi;

// People's names start with a capital; craft descriptions ("head of
// department", "musical director") do not.
const STARTS_LIKE_A_NAME = /^\p{Lu}/u;

const NAME_SUFFIX = /^(jr|sr|jr\.|sr\.|ii|iii|iv|m\.d\.)$/i;

const STOP_WORD = /^(the|a|an|and|or|of|de|le|la|el|los|las)$/i;

const ROLE =
  /^((assistant|associate|executive|supervising|co-|sound|musical|music|art|line|field|animation)[\s-]?)*(producer|producers|director|directors|direction|decoration|screenplay|story|adaptation|lyrics?|narrator|animators?|editors?|writers?|cinematographers?|departments?|head of department)$/i;

const ORGANISATION =
  /\b(studios?|department|inc\.?|ltd\.?|llc|productions?|pictures|films?|bureau|associates|corporation|company|bros\.?|television|network|entertainment|committee|ministry|institute|foundation|show|hour|theatre|theater)\b/i;
