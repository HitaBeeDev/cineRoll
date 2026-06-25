import { HttpError } from "../../middleware/errorHandler";
import {
  findCandidateNames,
  getPersonAwardRows,
  getPersonFilmRows,
  getPersonRecord,
} from "./personRepository";
import { nameToSlug, slugToCandidateName } from "./slug";
import { FilmRow, PersonFilm } from "./types";

export async function getPersonProfile(slug: string) {
  const canonicalName = await findCanonicalName(slug);
  const [{ oscarRows, ggRows, cannesRows }, { directorFilms, nomineeFilms }, personRecord] =
    await Promise.all([
      getPersonAwardRows(canonicalName),
      getPersonFilmRows(canonicalName),
      getPersonRecord(slug),
    ]);
  const allRecords = [...oscarRows, ...ggRows, ...cannesRows];

  return {
    name: canonicalName,
    slug,
    photoUrl: personRecord?.photoUrl ?? null,
    bio: personRecord?.bio ?? null,
    totalNominations: allRecords.length,
    totalWins: allRecords.filter(record => record.won).length,
    oscarRecords: oscarRows,
    ggRecords: ggRows,
    cannesRecords: cannesRows,
    films: mergePersonFilms(directorFilms, nomineeFilms),
  };
}

async function findCanonicalName(slug: string): Promise<string> {
  const names = await findCandidateNames(slugToCandidateName(slug));
  const canonicalName = names.find(name => nameToSlug(name) === slug);

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
