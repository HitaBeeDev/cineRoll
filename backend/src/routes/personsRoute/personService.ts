import { HttpError } from "../../middleware/errorHandler";
import { getCastHeadshot } from "./getCastHeadshot";
import { getDirectorFilms, getPersonRecord } from "./personRepository";
import { displayPersonName } from "./displayPersonName";
import { getPersonCreditIndex } from "./personCreditIndex";
import type { AwardCreditRow } from "./personCreditTypes";
import { AwardRow, FilmRow, PersonFilm } from "./types";

export async function getPersonProfile(slug: string) {
  const index = await getPersonCreditIndex();
  const canonicalName = findCanonicalName(index.names, slug);
  const credits = index.credits.get(slug) ?? [];
  const [directorFilms, personRecord] = await Promise.all([
    getDirectorFilms(canonicalName),
    getPersonRecord(slug),
  ]);
  const oscarRows = awardRows(credits, "oscar");
  const ggRows = awardRows(credits, "gg");
  const cannesRows = awardRows(credits, "cannes");
  const nomineeFilms = nominatedFilms(credits);
  const allRecords = [...oscarRows, ...ggRows, ...cannesRows];
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

function findCanonicalName(names: Map<string, string>, slug: string): string {
  // Through the slug index: the only way back from "pedro-almodovar" to
  // "Pedro Almodóvar" is to have slugged every known name first.
  const canonicalName = names.get(slug);

  if (!canonicalName) {
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
