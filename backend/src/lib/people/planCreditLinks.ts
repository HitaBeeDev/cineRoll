import { nameToSlug } from "../../routes/personsRoute/slug";
import { splitCredit } from "../../routes/personsRoute/splitCredit";
import { matchTmdbPerson, nameKey, type TmdbCreditPerson } from "./tmdbCreditMatch";

export type PlanCredit = {
  body: "oscar" | "gg" | "cannes" | "berlin";
  awardYear: number;
  category: string;
  won: boolean;
  nominee: string | null;
};

export type PlanFilm = {
  id: string;
  slug: string;
  title: string;
  director: string | null;
  credits: PlanCredit[];
  /** The film's TMDB cast and crew; null when the film has no TMDB id or the fetch failed. */
  tmdbCredits: TmdbCreditPerson[] | null;
};

/** A decision made by hand in data/person-overrides.json. `film` omitted = every film. */
export type PersonOverride = { name: string; film?: string } & (
  | { tmdbPersonId: number; notAPerson?: never }
  | { notAPerson: true; tmdbPersonId?: never }
);

export type ExistingPerson = { id: string; slug: string; name: string; tmdbPersonId: number | null };

export type MatchedBy = "tmdb" | "override" | "name";

export type PlannedPerson = {
  key: string;
  existingId: string | null;
  slug: string;
  name: string;
  tmdbPersonId: number | null;
  status: "verified" | "unverified";
  aliases: string[];
};

export type PlannedLink = { personKey: string; position: number; matchedBy: MatchedBy };
export type PlannedCredit = PlanCredit & { filmId: string; people: PlannedLink[] };
export type ReviewRow = {
  name: string;
  filmSlug: string;
  filmTitle: string;
  category: string;
  awardYear: number | null;
  reason: string;
  candidates: string;
};

export type CreditPlan = {
  persons: PlannedPerson[];
  credits: PlannedCredit[];
  directors: Array<{ filmId: string; personKey: string }>;
  review: ReviewRow[];
};

type Mention = { name: string; film: PlanFilm; credit: PlanCredit | null; position: number };

/**
 * Turns award credit lines into people with stable identities.
 *
 * Every credited name is looked up in the film's OWN TMDB cast and crew: a hit
 * is that TMDB person, verified. A hand decision in the overrides file wins
 * over that. A name TMDB doesn't list for the film is linked by spelling to a
 * verified person when exactly one has that spelling (marked "name", listed for
 * review), and otherwise becomes an unverified person — still a page, never in
 * the sitemap until someone confirms it. Existing Person rows keep their id and
 * slug, so URLs, photos and bios survive.
 */
export function planCreditLinks(
  films: PlanFilm[],
  overrides: PersonOverride[],
  existing: ExistingPerson[],
): CreditPlan {
  const review: ReviewRow[] = [];
  const spellings = new Map<string, Map<string, number>>(); // personKey → spelling → times seen
  const tmdbKeyBySlug = new Map<string, Set<string>>(); // spelling slug → verified keys using it
  const pending: Array<{ mention: Mention; link: PlannedLink; credit: PlannedCredit | null; filmId: string }> = [];

  const credits: PlannedCredit[] = [];
  const directors: Array<{ filmId: string; personKey: string }> = [];

  const remember = (key: string, name: string) => {
    const seen = spellings.get(key) ?? new Map<string, number>();
    seen.set(name, (seen.get(name) ?? 0) + 1);
    spellings.set(key, seen);
    if (key.startsWith("tmdb:")) {
      const slug = nameToSlug(name);
      const keys = tmdbKeyBySlug.get(slug) ?? new Set<string>();
      keys.add(key);
      tmdbKeyBySlug.set(slug, keys);
    }
  };

  /** Pass 1: everything that can be decided from the film itself or a hand decision. */
  const resolve = (mention: Mention): { key: string; matchedBy: MatchedBy } | "skip" | null => {
    const override = findOverride(overrides, mention.name, mention.film.slug);
    if (override?.notAPerson) return "skip";
    if (override?.tmdbPersonId) return { key: `tmdb:${override.tmdbPersonId}`, matchedBy: "override" };
    const tmdbId = mention.film.tmdbCredits ? matchTmdbPerson(mention.name, mention.film.tmdbCredits) : null;
    return tmdbId ? { key: `tmdb:${tmdbId}`, matchedBy: "tmdb" } : null;
  };

  for (const film of films) {
    for (const credit of film.credits) {
      const planned: PlannedCredit = { ...credit, filmId: film.id, people: [] };
      credits.push(planned);
      splitCredit(credit.nominee, film.title, credit.category).forEach((name, position) => {
        const mention = { name, film, credit, position };
        const decided = resolve(mention);
        if (decided === "skip") return;
        if (decided) {
          remember(decided.key, name);
          planned.people.push({ personKey: decided.key, position, matchedBy: decided.matchedBy });
        } else {
          pending.push({ mention, link: { personKey: "", position, matchedBy: "name" }, credit: planned, filmId: film.id });
        }
      });
    }

    // The director field goes through the same parser: "Joel Coen, Ethan Coen" is two people.
    splitCredit(film.director, film.title, "Directing").forEach((name, position) => {
      const mention = { name, film, credit: null, position };
      const decided = resolve(mention);
      if (decided === "skip") return;
      if (decided) {
        remember(decided.key, name);
        directors.push({ filmId: film.id, personKey: decided.key });
      } else {
        pending.push({ mention, link: { personKey: "", position, matchedBy: "name" }, credit: null, filmId: film.id });
      }
    });
  }

  // Pass 2: names the film's TMDB credits don't list.
  for (const { mention, link, credit, filmId } of pending) {
    const slug = nameToSlug(mention.name);
    if (!slug) continue;
    const verified = tmdbKeyBySlug.get(slug);
    const key = verified?.size === 1 ? [...verified][0]! : `name:${slug}`;
    remember(key, mention.name);
    if (credit) credit.people.push({ ...link, personKey: key });
    else directors.push({ filmId, personKey: key });

    review.push({
      name: mention.name,
      filmSlug: mention.film.slug,
      filmTitle: mention.film.title,
      category: mention.credit?.category ?? "Director",
      awardYear: mention.credit?.awardYear ?? null,
      reason: !mention.film.tmdbCredits
        ? "film has no TMDB credits"
        : verified?.size === 1
          ? "linked by name only: not in this film's TMDB credits"
          : verified && verified.size > 1
            ? "several verified people share this name"
            : "not in this film's TMDB credits",
      candidates: candidatesFor(mention.name, mention.film.tmdbCredits),
    });
  }

  for (const credit of credits) credit.people.sort((a, b) => a.position - b.position);

  return { persons: buildPersons(spellings, existing, credits, directors), credits, directors, review };
}

function findOverride(overrides: PersonOverride[], name: string, filmSlug: string): PersonOverride | undefined {
  const key = nameKey(name);
  const forName = overrides.filter(override => nameKey(override.name) === key);
  return forName.find(override => override.film === filmSlug) ?? forName.find(override => !override.film);
}

/** Up to three people in the film's TMDB credits sharing a word with the name, as "Name (#id)". */
function candidatesFor(name: string, filmCredits: TmdbCreditPerson[] | null): string {
  if (!filmCredits) return "";
  const words = new Set(nameKey(name).split(" "));
  const seen = new Set<number>();
  return filmCredits
    .filter(person => {
      if (seen.has(person.id)) return false;
      seen.add(person.id);
      return nameKey(person.name).split(" ").some(word => words.has(word));
    })
    .slice(0, 3)
    .map(person => `${person.name} (#${person.id})`)
    .join("; ");
}

/**
 * One Person per key. The slug is kept from an existing row (URLs never move);
 * otherwise it comes from the spelling with the fewest capitals ("Pedro
 * Almodóvar" over "Pedro ALMODÓVAR"). When two people want one slug, the one
 * with more credits keeps it and the other gets the TMDB id appended. Every
 * other spelling's slug becomes an alias that redirects.
 */
function buildPersons(
  spellings: Map<string, Map<string, number>>,
  existing: ExistingPerson[],
  credits: PlannedCredit[],
  directors: Array<{ filmId: string; personKey: string }>,
): PlannedPerson[] {
  const byTmdb = new Map(existing.filter(p => p.tmdbPersonId).map(p => [p.tmdbPersonId!, p]));
  const bySlug = new Map(existing.map(p => [p.slug, p]));
  const weight = new Map<string, number>();
  for (const credit of credits) for (const link of credit.people) weight.set(link.personKey, (weight.get(link.personKey) ?? 0) + 1);
  for (const director of directors) weight.set(director.personKey, (weight.get(director.personKey) ?? 0) + 1);

  const keys = [...spellings.keys()].sort((a, b) => (weight.get(b) ?? 0) - (weight.get(a) ?? 0) || a.localeCompare(b));
  const taken = new Set<string>();
  const usedExisting = new Set<string>();
  const persons: PlannedPerson[] = [];

  for (const key of keys) {
    const names = spellings.get(key)!;
    const name = preferredSpelling(names);
    const tmdbPersonId = key.startsWith("tmdb:") ? Number(key.slice(5)) : null;
    const wanted = nameToSlug(name);

    let row = tmdbPersonId ? byTmdb.get(tmdbPersonId) : undefined;
    if (!row) {
      const sameSlug = bySlug.get(wanted);
      // Reuse a row with this slug only if it isn't someone else's TMDB person.
      if (sameSlug && !usedExisting.has(sameSlug.id) && (!sameSlug.tmdbPersonId || sameSlug.tmdbPersonId === tmdbPersonId)) {
        row = sameSlug;
      }
    }
    if (row) usedExisting.add(row.id);

    // A slug already owned by another row in the table (one this plan doesn't
    // reuse) is just as taken as one handed out above.
    const ownedByOther = (candidate: string) => {
      const owner = bySlug.get(candidate);
      return owner !== undefined && owner.id !== row?.id;
    };
    let slug = row?.slug ?? wanted;
    if (taken.has(slug) || ownedByOther(slug)) slug = `${wanted}-${tmdbPersonId ?? persons.length}`;
    taken.add(slug);

    persons.push({
      key,
      existingId: row?.id ?? null,
      slug,
      name,
      tmdbPersonId,
      status: tmdbPersonId ? "verified" : "unverified",
      aliases: [],
    });
  }

  // Aliases last, so a spelling's slug never shadows another person's own page.
  for (const person of persons) {
    for (const spelling of spellings.get(person.key)!.keys()) {
      const alias = nameToSlug(spelling);
      if (alias && alias !== person.slug && !taken.has(alias) && !bySlug.has(alias)) {
        person.aliases.push(alias);
        taken.add(alias);
      }
    }
  }

  return persons;
}

function preferredSpelling(names: Map<string, number>): string {
  const capitals = (value: string) => (value.match(/\p{Lu}/gu) ?? []).length;
  return [...names.entries()].sort(([a, seenA], [b, seenB]) => capitals(a) - capitals(b) || seenB - seenA || a.localeCompare(b))[0]![0];
}
