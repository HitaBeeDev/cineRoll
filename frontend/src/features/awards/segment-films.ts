import type { AwardFilm } from "./award-types";
import type { AwardSegment } from "./resolve-award-segment";
import { uniqueFilms } from "./unique-films";

/** The films a year, category or genre page lists, for its ItemList. */
export function segmentFilms(segment: AwardSegment): AwardFilm[] {
  if (segment.kind === "year") return uniqueFilms(segment.data.categories.flatMap((c) => c.entries));
  if (segment.kind === "category") return uniqueFilms(segment.data.years.flatMap((y) => y.entries));
  return segment.data.films.map(({ film }) => film);
}
