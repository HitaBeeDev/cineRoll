import { HttpError } from "../../middleware/errorHandler";
import { getCastHeadshot } from "./getCastHeadshot";
import { getDirectorFilms, getPersonRecord } from "./personRepository";
import { displayPersonName } from "./displayPersonName";
import { getPersonCreditIndex } from "./personCreditIndex";
import { resolveRetiredPersonSlug } from "./resolveRetiredPersonSlug";
import type { AwardCreditRow, PersonCreditIndex } from "./personCreditTypes";
import { AwardRow, FilmRow, PersonFilm } from "./types";

export async function getPersonProfile(slug: string) {
  const index = await getPersonCreditIndex();
  const canonicalName = findCanonicalName(index, slug);
  const credits = index.credits.get(slug) ?? [];
  const [directorFilms, personRecord] = await Promise.all([
    // From the Credit tables directors are linked per film (co-directors split);
    // the legacy path still matches the raw director field by name.
    index.directed ? Promise.resolve(index.directed.get(slug) ?? []) : getDirectorFilms(canonicalName),
    getPersonRecord(slug),
  ]);
  const oscarRows = awardRows(credits, "oscar");
  const ggRows = awardRows(credits, "gg");
  const cannesRows = awardRows(credits, "cannes");
  const berlinRows = awardRows(credits, "berlin");
  const nomineeFilms = nominatedFilms(credits);
  const allRecords = [...oscarRows, ...ggRows, ...cannesRows, ...berlinRows];
  // Only when the Person row has no picture of its own — the film data is a
  // stand-in for a field that should be filled, not the source of record.
  const photoUrl = personRecord?.photoUrl ?? (await getCastHeadshot(canonicalName));

  return {
    name: displayPersonName(canonicalName),
    slug,
    photoUrl,
    bio: personRecord?.bio ?? null,
    totalNominations: allRecords.length,
    totalWins: allRecords.filter(record => record.won).length,
    oscarRecords: oscarRows,
    ggRecords: ggRows,
    cannesRecords: cannesRows,
    berlinRecords: berlinRows,
    films: mergePersonFilms(directorFilms, nomineeFilms),
  };
}

/** One body's rows for the page, newest ceremony first. */
function awardRows(credits: AwardCreditRow[], body: AwardCreditRow["body"]): AwardRow[] {
  return credits
    .filter(credit => credit.body === body)
    .map(credit => ({
      filmSlug: credit.filmSlug,
      filmTitle: credit.filmTitle,
      releaseYear: credit.releaseYear,
      posterUrl: credit.posterUrl,
      category: credit.category,
      awardYear: credit.awardYear,
      won: credit.won,
    }))
    .sort((a, b) => b.awardYear - a.awardYear || a.category.localeCompare(b.category));
}

/** Each film the person was nominated for, once, newest first. */
function nominatedFilms(credits: AwardCreditRow[]): FilmRow[] {
  const films = new Map<string, FilmRow>();
  for (const credit of credits) {
    films.set(credit.filmId, {
      id: credit.filmId,
      slug: credit.filmSlug,
      title: credit.filmTitle,
      releaseYear: credit.releaseYear,
      posterUrl: credit.posterUrl,
      imdbRating: credit.imdbRating,
    });
  }
  return [...films.values()].sort((a, b) => b.releaseYear - a.releaseYear);
}

function findCanonicalName(index: PersonCreditIndex, slug: string): string {
  const { names } = index;
  // Through the slug index: the only way back from "pedro-almodovar" to
  // "Pedro Almodóvar" is to have slugged every known name first.
  const canonicalName = names.get(slug);

  if (!canonicalName) {
    // Another spelling of a known person ("joon-ho-bong" → "bong-joon-ho").
    const aliasOf = index.aliases?.get(slug);
    if (aliasOf) {
      throw new HttpError(404, `Person moved: ${slug}`, "PERSON_MOVED", { redirectTo: aliasOf });
    }
    // An old credit-line URL (/person/written-by-damien-chazelle) that stood
    // for one real person: still a 404 here, but it names the page to
    // redirect to, and the frontend sends a permanent redirect.
    const redirectTo = resolveRetiredPersonSlug(slug, names);
    if (redirectTo) {
      throw new HttpError(404, `Person moved: ${slug}`, "PERSON_MOVED", { redirectTo });
    }
    throw new HttpError(404, `Person not found: ${slug}`, "PERSON_NOT_FOUND");
  }

  return canonicalName;
}

function mergePersonFilms(directorFilms: FilmRow[], nomineeFilms: FilmRow[]): PersonFilm[] {
  const filmMap = new Map<string, PersonFilm>();

  for (const film of nomineeFilms) {
    filmMap.set(film.id, { ...film, role: "nominee" });
  }

  for (const film of directorFilms) {
    filmMap.set(film.id, { ...film, role: "director" });
  }

  return [...filmMap.values()].sort((a, b) => b.releaseYear - a.releaseYear);
}
