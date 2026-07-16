import type { RollFilm } from "@/lib/api";
import { formatFilmLength } from "@/lib/format";

export function getPickMetadata(film: RollFilm): string[] {
  const metadata = [String(film.year)];
  const runtime = formatFilmLength(film);
  const primaryGenre = film.genres[0];
  if (runtime) metadata.push(runtime);
  if (primaryGenre) metadata.push(primaryGenre);
  return metadata;
}
