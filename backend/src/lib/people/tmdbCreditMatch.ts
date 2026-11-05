/** A person as TMDB lists them in one film's cast or crew. */
export type TmdbCreditPerson = { id: number; name: string };

/** How a credited name was found in the film's TMDB credits. */
export type TmdbMatch = { id: number; exact: boolean };

/**
 * A comparison key for a person's name that ignores accents, case,
 * punctuation and word order. Award bodies and TMDB write the same person
 * differently — "Bong Joon Ho" / "Bong Joon-ho", "Pedro ALMODÓVAR" / "Pedro
 * Almodóvar", Berlin's family-name-first "SHIMIZU Hiroshi" — and all of those
 * reduce to the same set of words.
 */
export function nameKey(name: string): string {
  return words(name).sort().join(" ");
}

function words(name: string): string[] {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/,\s*(jr|sr)\.?$/, " $1")
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

/**
 * The TMDB person a credited name refers to, looked up in THAT film's own
 * cast and crew — so "John Williams" on Jaws is the composer, not one of the
 * other John Williamses.
 *
 * Two tiers. An exact name key first. Only if nothing matches exactly, a near
 * match: the same surname (or one letter off: Basserman/Bassermann) and a
 * compatible first name — equal, a nickname (Charles/Charlie), or an initial
 * (E. H. Hansen / Edmund H. Hansen) — with middle initials ignored (Allen
 * Davey / Allen M. Davey). Searching one film's credits keeps this safe; it
 * still has to be exactly one person, or there is no match.
 */
export function matchTmdbPerson(name: string, filmCredits: readonly TmdbCreditPerson[]): TmdbMatch | null {
  const key = nameKey(name);
  if (!key) return null;

  const exact = unique(filmCredits.filter(person => nameKey(person.name) === key));
  if (exact.length === 1) return { id: exact[0]!, exact: true };
  if (exact.length > 1) return null;

  const near = unique(filmCredits.filter(person => isNearName(name, person.name)));
  return near.length === 1 ? { id: near[0]!, exact: false } : null;
}

function unique(people: readonly TmdbCreditPerson[]): number[] {
  return [...new Set(people.map(person => person.id))];
}

/** First and last word, with middle initials and Jr./Sr. dropped. */
function firstAndLast(name: string): [string, string] | null {
  const parts = words(name).filter(word => !["jr", "sr", "ii", "iii"].includes(word));
  const first = parts[0];
  const last = parts[parts.length - 1];
  if (!first || !last || parts.length < 2) return null;
  // "Edmund H. Hansen" keeps "edmund"; a middle "h" plays no part.
  return [first, last];
}

function isNearName(award: string, tmdb: string): boolean {
  const left = firstAndLast(award);
  const right = firstAndLast(tmdb);
  if (!left || !right) return false;
  const [firstA, lastA] = left;
  const [firstB, lastB] = right;
  const surnameMatches = lastA === lastB || (lastA.length >= 5 && lastB.length >= 5 && withinOneEdit(lastA, lastB));
  return surnameMatches && compatibleFirstNames(firstA, firstB);
}

function compatibleFirstNames(a: string, b: string): boolean {
  if (a === b) return true;
  // An initial: "e" (from "E. H. Hansen") fits "edmund".
  if (a.length === 1 || b.length === 1) return a[0] === b[0];
  return NICKNAMES.some(group => group.includes(a) && group.includes(b));
}

/** True when one insertion, deletion or substitution turns a into b. */
function withinOneEdit(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++;
      j++;
      continue;
    }
    if (++edits > 1) return false;
    if (a.length > b.length) i++;
    else if (b.length > a.length) j++;
    else {
      i++;
      j++;
    }
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
}

// Common English forms of one first name, as credits and TMDB swap them.
const NICKNAMES: string[][] = [
  ["charles", "charlie", "chuck", "chas"],
  ["william", "bill", "billy", "will", "willie"],
  ["robert", "bob", "bobby", "rob", "robbie", "bert"],
  ["samuel", "sam", "sammy"],
  ["james", "jim", "jimmy", "jamie"],
  ["edward", "ed", "eddie", "ted", "teddy"],
  ["richard", "dick", "rick", "ricky", "rich"],
  ["thomas", "tom", "tommy"],
  ["joseph", "joe", "joey"],
  ["michael", "mike", "mick", "mickey"],
  ["albert", "al", "bert"],
  ["frederick", "frederic", "fred", "freddie", "freddy"],
  ["alexander", "alex", "sandy"],
  ["daniel", "dan", "danny"],
  ["david", "dave", "davey"],
  ["benjamin", "ben", "benny"],
  ["nicholas", "nick", "nicky"],
  ["anthony", "tony"],
  ["lawrence", "laurence", "larry"],
  ["kenneth", "ken", "kenny"],
  ["ronald", "ron", "ronnie"],
  ["donald", "don", "donnie"],
  ["gerald", "jerry", "gerry"],
  ["stephen", "steven", "steve"],
  ["andrew", "andy", "drew"],
  ["peter", "pete"],
  ["patrick", "pat", "paddy"],
  ["matthew", "matt"],
  ["henry", "harry", "hank"],
  ["john", "jack", "johnny"],
  ["leonard", "leo", "len", "lenny"],
  ["raymond", "ray"],
  ["eugene", "gene"],
  ["harold", "hal", "harry"],
  ["walter", "walt"],
  ["katherine", "catherine", "kathryn", "kate", "kathy", "katie", "cathy"],
  ["elizabeth", "liz", "beth", "betty", "eliza"],
  ["margaret", "maggie", "peggy", "meg"],
  ["patricia", "pat", "patty", "trish"],
  ["susan", "sue", "suzy"],
  ["deborah", "debra", "debbie", "deb"],
];
