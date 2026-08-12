import { Prisma } from "@prisma/client";

import { createCeremonyYearCheck } from "./createCeremonyYearCheck";
import { extractAwardYears } from "./extractAwardYears";
import { extractLeadCastIds } from "./extractLeadCastIds";
import type { SimilaritySourceFilm } from "./similaritySourceFilm";
import type { SimilarityCriterion, SimilaritySql } from "./similaritySql";

/**
 * What makes two titles neighbours, and by how much.
 *
 * This was three unweighted flags — same director, shared genre, shared award
 * era — which meant hundreds of candidates tied on a score of 1 or 2 and the
 * real ranking fell through to `imdbRating DESC`. Prestige television outrates
 * nearly every film ever made (Chernobyl 9.3, Game of Thrones 9.2), so *every*
 * drama in the catalogue surfaced the same handful of series. Parasite — Palme
 * d'Or, Best Picture — recommended five TV shows and no films.
 *
 * Content type is therefore weighted above everything: a film's neighbours
 * should be films. Director stays the strongest single content signal, then a
 * shared lead, then genre. Country, language and era are tie-breakers that
 * separate candidates already alike, which is exactly the job IMDb rating was
 * doing badly.
 *
 * Weights are ordinal, not calibrated — they encode "a shared director matters
 * more than a shared genre", nothing finer. Distinct values matter more than
 * their exact size.
 */
const WEIGHT = {
  contentType: 4,
  director: 3,
  cast: 2,
  genre: 2,
  country: 1,
  language: 1,
  era: 1,
  ceremony: 1,
} as const;

/** Two titles are of an era if their release years are within this many years. */
const ERA_SPAN_YEARS = 10;

export const buildSimilaritySql = (film: SimilaritySourceFilm): SimilaritySql => {
  const criteria: SimilarityCriterion[] = [];

  // Narrowing — index-backed, and each one alone is a reason to be considered.
  addDirector(criteria, film.director);
  addGenres(criteria, film.genres);
  addCast(criteria, extractLeadCastIds(film));
  addCeremonyYears(criteria, extractAwardYears(film));

  // Ranking only — true of far too many rows to define a neighbourhood.
  addContentType(criteria, film.contentType);
  addCountries(criteria, film.originCountries);
  addLanguage(criteria, film.language);
  addEra(criteria, film.releaseYear);

  return { criteria };
};

const addDirector = (criteria: SimilarityCriterion[], director: string | null): void => {
  if (!director) return;

  criteria.push({
    condition: Prisma.sql`"Film"."director" = ${director}`,
    weight: WEIGHT.director,
    narrowing: true,
  });
};

const addGenres = (criteria: SimilarityCriterion[], genres: string[]): void => {
  if (genres.length === 0) return;

  const list = Prisma.join(genres.map(genre => Prisma.sql`${genre}`), ",");
  criteria.push({
    condition: Prisma.sql`"Film"."genres" && ARRAY[${list}]::text[]`,
    weight: WEIGHT.genre,
    narrowing: true,
  });
};

const addCast = (criteria: SimilarityCriterion[], castIds: number[]): void => {
  if (castIds.length === 0) return;

  const list = Prisma.join(castIds.map(id => Prisma.sql`${id}`), ",");
  criteria.push({
    condition: Prisma.sql`EXISTS (
      SELECT 1 FROM jsonb_array_elements("Film"."cast") AS member
      WHERE (member->>'tmdbPersonId')::int = ANY(ARRAY[${list}]::int[])
    )`,
    weight: WEIGHT.cast,
    narrowing: true,
  });
};

const addCeremonyYears = (criteria: SimilarityCriterion[], years: number[]): void => {
  if (years.length === 0) return;

  criteria.push({
    condition: createCeremonyYearCheck(years),
    weight: WEIGHT.ceremony,
    narrowing: true,
  });
};

const addContentType = (criteria: SimilarityCriterion[], contentType: string | null): void => {
  if (!contentType) return;

  criteria.push({
    condition: Prisma.sql`"Film"."contentType" = ${contentType}`,
    weight: WEIGHT.contentType,
    narrowing: false,
  });
};

const addCountries = (criteria: SimilarityCriterion[], countries: string[]): void => {
  if (countries.length === 0) return;

  const list = Prisma.join(countries.map(country => Prisma.sql`${country}`), ",");
  criteria.push({
    condition: Prisma.sql`"Film"."originCountries" && ARRAY[${list}]::text[]`,
    weight: WEIGHT.country,
    narrowing: false,
  });
};

const addLanguage = (criteria: SimilarityCriterion[], language: string | null): void => {
  if (!language) return;

  criteria.push({
    condition: Prisma.sql`"Film"."language" = ${language}`,
    weight: WEIGHT.language,
    narrowing: false,
  });
};

const addEra = (criteria: SimilarityCriterion[], releaseYear: number): void => {
  criteria.push({
    // Column is "year"; `releaseYear` is the Prisma field name and does not
    // exist in the database (schema.prisma:19 maps it).
    condition: Prisma.sql`abs("Film"."year" - ${releaseYear}) <= ${ERA_SPAN_YEARS}`,
    weight: WEIGHT.era,
    narrowing: false,
  });
};
