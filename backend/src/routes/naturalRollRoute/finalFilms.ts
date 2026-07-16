import { RandomFilmRow } from "../random";
import { rerankCandidates } from "./reranker";
import { SoftPreferences } from "./softPreferences";

export async function selectFinalFilms(
  prompt: string,
  preferences: SoftPreferences,
  candidates: RandomFilmRow[],
  count: number,
): Promise<RandomFilmRow[]> {
  if (candidates.length <= count) return candidates;

  const pickedIds = await rerankCandidates(prompt, preferences, candidates, count);
  const pickedFilms = filmsByPickedIds(candidates, pickedIds);

  return padMissingPicks(pickedFilms, candidates, pickedIds, count);
}

function filmsByPickedIds(candidates: RandomFilmRow[], pickedIds: string[]): RandomFilmRow[] {
  const idToFilm = new Map(candidates.map(film => [film.id, film]));

  return pickedIds
    .map(id => idToFilm.get(id))
    .filter((film): film is RandomFilmRow => film !== undefined);
}

function padMissingPicks(
  pickedFilms: RandomFilmRow[],
  candidates: RandomFilmRow[],
  pickedIds: string[],
  count: number,
): RandomFilmRow[] {
  const target = Math.min(count, candidates.length);
  if (pickedFilms.length >= target) return pickedFilms;

  const picked = new Set(pickedIds);
  const rest = candidates.filter(film => !picked.has(film.id));

  return [...pickedFilms, ...rest].slice(0, count);
}
