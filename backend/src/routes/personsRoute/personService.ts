import { HttpError } from "../../middleware/errorHandler";
import { getCastHeadshot } from "./getCastHeadshot";
import {
  getPersonAwardRows,
  getPersonFilmRows,
  getPersonRecord,
} from "./personRepository";
import { displayPersonName } from "./displayPersonName";
import { getPersonNameIndex } from "./personNameIndex";
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

async function findCanonicalName(slug: string): Promise<string> {
  // Through the slug index: the only way back from "pedro-almodovar" to
  // "Pedro Almodóvar" is to have slugged every known name first.
  const canonicalName = (await getPersonNameIndex()).get(slug);

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
