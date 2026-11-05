/**
 * One award row's `nominee` → the individual people it credits.
 *
 * The award data stores whatever the source printed: a plain name ("Pedro
 * Almodóvar"), a credit line ("Written by Pedro Almodóvar", "Screenplay by A,
 * B; Adaptation by C"), a pair ("Joel Coen and Ethan Coen"), a name with its
 * role ("Stanley Kubrick, Producer"), or no person at all (the film or song
 * title, "Special Award"). Matching whole strings missed every credit-line win
 * — Almodóvar's 2003 screenplay Oscar among ~390 rows — and turned the strings
 * themselves into junk person pages (/person/written-by-damien-chazelle,
 * /person/joel-coen-and-ethan-coen). Every person feature reads names through
 * this one function so they cannot disagree.
 */
export function splitCredit(
  nominee: string | null | undefined,
  filmTitle?: string | null,
  category?: string | null,
): string[] {
  if (!nominee) return [];
  const raw = nominee.trim();
  if (!raw || raw === "NaN") return [];
  if (filmTitle && sameText(raw, filmTitle)) return [];
  if (category && namesNoOne(category, raw)) return [];

  // A one-word nominee is a person only where the category is about a person
  // — a performance (Cher), directing (Costa-Gavras), costume design
  // (Orry-Kelly, Renie); elsewhere it is a country, studio or title.
  const allowSingle = !!category && /act(?:or|ress)|perform|direct(?:ing|or)|costume/i.test(category);
  const names: string[] = [];
  for (const segment of raw.split(";")) {
    // '"Piccolino" from "Top Hat"' — quoted titles with no "by" name no one.
    if (/["“”]/.test(segment) && !/\bby\s/i.test(segment)) continue;
    const parts = stripRolePrefix(segment.trim())
      .split(/\s*,\s*|\s+and\s+|\s*&\s*/i)
      // "(Howard Estabrook)", "“Name”" — brackets and quotes are punctuation, not the name.
      .map(part => part.replace(/^[("“'‘\s]+|[)"”'’\s]+$/g, "").trim())
      .filter(Boolean);

    for (const part of parts) {
      // "Sammy Davis, Jr." — the suffix belongs to the name before it.
      if (SUFFIX.test(part) && names.length > 0) {
        names[names.length - 1] = `${names[names.length - 1]}, ${part}`;
        continue;
      }
      if (looksLikePerson(part, allowSingle)) names.push(part);
    }
  }
  return [...new Set(names)];
}

/**
 * Categories whose nominee is a title, not a credit: a song with no "by"
 * (the Globes print the song's name), and series / motion-picture prizes that
 * aren't about a person ("The People v. O.J. Simpson: American Crime Story")
 * — unless the line names producers.
 */
function namesNoOne(category: string, nominee: string): boolean {
  // "Song", not "Song Score" — a score category credits composers by name.
  if (/song(?!\s*score)/i.test(category) && !/\bby\s/i.test(nominee)) return true;
  return (
    /series|motion picture/i.test(category) &&
    !/act|direct|screen|writ|score|song|perform|support/i.test(category) &&
    // The Oscars' old "Best Motion Picture" credits its producers by name.
    !/\bproducers?\b/i.test(nominee)
  );
}

// "Art Direction: …", "Set Decoration: …" — a label before a colon.
const LABEL_PREFIX = /^[^:]{1,40}:\s*/;
const SUFFIX = /^(?:jr|sr)\.?$|^(?:ii|iii|iv)$/i;

// Words that mark a role, a body or a thing — never part of a person's name.
const NOT_A_NAME = new Set([
  "producer", "producers", "production", "design", "designer", "decoration", "direction", "director",
  "award", "special", "honorary", "corporation", "company", "studios", "studio", "inc", "inc.", "ltd",
  "pictures", "productions", "films", "department", "laboratories", "laboratory", "sound", "music",
  "the", "of", "for", "with", "film", "picture", "song", "score", "effects", "visual", "costume",
]);

/**
 * Everything up to the last whole-word "by" is the role ("Written by",
 * "Mona Lisa in "Captain Carey, U.S.A." Music and Lyrics by") — the people
 * follow it. "by" as a whole word only, so "Busby Berkeley" is safe. Then a
 * colon label ("Art Direction: …").
 */
function stripRolePrefix(segment: string): string {
  const byAt = segment.search(/\bby\s+(?!.*\bby\s)/i);
  const afterBy = byAt >= 0 ? segment.slice(byAt).replace(/^by\s+/i, "") : segment;
  return afterBy.replace(LABEL_PREFIX, "");
}

/**
 * Two to six words (one, in a performance category), each starting with a capital letter (or a lowercase
 * particle such as "de", "van", "von", "da"), no digits, and none of them a
 * role or company word.
 */
function looksLikePerson(part: string, allowSingle: boolean): boolean {
  if (/\d/.test(part)) return false;
  const words = part.split(/\s+/);
  if (words.length < (allowSingle ? 1 : 2) || words.length > 6) return false;
  if (!/^\p{Lu}/u.test(words[0]!)) return false;
  return words.every(word => {
    if (NOT_A_NAME.has(word.toLowerCase())) return false;
    return /^\p{Lu}/u.test(word) || PARTICLES.has(word.toLowerCase());
  });
}

const PARTICLES = new Set(["de", "da", "di", "du", "del", "della", "der", "den", "van", "von", "le", "la", "dos", "das", "bin", "al", "y", "e", "ter", "zu"]);

function sameText(a: string, b: string): boolean {
  const norm = (value: string) => value.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "");
  return norm(a) === norm(b);
}
