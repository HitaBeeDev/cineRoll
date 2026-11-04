import { nameToSlug } from "../personsRoute/slug";
import type { AwardBodySlug } from "./awardBodies";
import type { AwardRow } from "./awardsRepository";
import { canonicalCategory } from "./canonicalCategory";

export type AwardFilm = { slug: string; title: string; year: number | null; posterUrl: string | null };
export type AwardEntry = { film: AwardFilm; won: boolean; nominee: string | null };
export type CategoryRef = { slug: string; name: string };

type YearBucket = { byCategory: Map<string, AwardEntry[]>; filmSlugs: Set<string> };
type CategoryBucket = {
  name: string;
  byYear: Map<number, AwardEntry[]>;
  filmSlugs: Set<string>;
};

/** A film's record at one body, for genre pages. */
export type AwardFilmRecord = { film: AwardFilm; wins: number; nominations: number };
type GenreBucket = { name: string; films: Map<string, AwardFilmRecord> };

/** One body's nominations, grouped by ceremony year, by category and by genre. */
export type AwardIndex = {
  years: Map<number, YearBucket>;
  categories: Map<string, CategoryBucket>;
  genres: Map<string, GenreBucket>;
};

/** Winners first, then by title — the order every award list reads in. */
export function compareEntries(a: AwardEntry, b: AwardEntry): number {
  if (a.won !== b.won) return a.won ? -1 : 1;
  return a.film.title.localeCompare(b.film.title);
}

function push<K, V>(map: Map<K, V[]>, key: K, value: V): void {
  const list = map.get(key);
  if (list) list.push(value);
  else map.set(key, [value]);
}

export function buildAwardIndex(body: AwardBodySlug, rows: AwardRow[]): AwardIndex {
  const years = new Map<number, YearBucket>();
  const categories = new Map<string, CategoryBucket>();
  const genres = new Map<string, GenreBucket>();

  for (const row of rows) {
    const category = canonicalCategory(body, row.category);
    const entry: AwardEntry = {
      film: { slug: row.slug, title: row.title, year: row.releaseYear, posterUrl: row.posterUrl },
      won: row.won,
      nominee: row.nominee,
    };

    let year = years.get(row.awardYear);
    if (!year) {
      year = { byCategory: new Map(), filmSlugs: new Set() };
      years.set(row.awardYear, year);
    }
    push(year.byCategory, category.slug, entry);
    year.filmSlugs.add(row.slug);

    let bucket = categories.get(category.slug);
    if (!bucket) {
      bucket = { name: category.name, byYear: new Map(), filmSlugs: new Set() };
      categories.set(category.slug, bucket);
    }
    push(bucket.byYear, row.awardYear, entry);
    bucket.filmSlugs.add(row.slug);

    for (const genreName of row.genres ?? []) {
      const genreSlug = nameToSlug(genreName);
      let genre = genres.get(genreSlug);
      if (!genre) {
        genre = { name: genreName, films: new Map() };
        genres.set(genreSlug, genre);
      }
      const record = genre.films.get(row.slug) ?? { film: entry.film, wins: 0, nominations: 0 };
      record.nominations += 1;
      if (row.won) record.wins += 1;
      genre.films.set(row.slug, record);
    }
  }

  for (const year of years.values()) {
    for (const list of year.byCategory.values()) list.sort(compareEntries);
  }
  for (const bucket of categories.values()) {
    for (const list of bucket.byYear.values()) list.sort(compareEntries);
  }

  return { years, categories, genres };
}
