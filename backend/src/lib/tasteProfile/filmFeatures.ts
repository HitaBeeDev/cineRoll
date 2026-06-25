import { Prisma } from "@prisma/client";

export const filmFeatureSelect = {
  genres: true,
  director: true,
  releaseYear: true,
  runtime: true,
  imdbRating: true,
  rtScore: true,
  oscarWins: true,
  oscarNominations: true,
  ggWins: true,
  ggNominations: true,
  cannesWins: true,
  cannesNominations: true,
  berlinWins: true,
  berlinNominations: true,
} satisfies Prisma.FilmSelect;

type FilmFeatureRow = Prisma.FilmGetPayload<{ select: typeof filmFeatureSelect }>;

const AWARD_BODIES = [
  { key: "oscar", wins: "oscarWins", nominations: "oscarNominations" },
  { key: "gg", wins: "ggWins", nominations: "ggNominations" },
  { key: "cannes", wins: "cannesWins", nominations: "cannesNominations" },
  { key: "berlin", wins: "berlinWins", nominations: "berlinNominations" },
] as const;

export function filmFeatureKeys(film: FilmFeatureRow) {
  return {
    genres: film.genres,
    director: film.director,
    decade: decadeKey(film.releaseYear),
    runtimeBand: runtimeBand(film.runtime),
    awards: awardKeys(film),
    ratingTiers: ratingTierKeys(film),
  };
}

function decadeKey(year: number | null): string | null {
  if (year == null) return null;

  return `${Math.floor(year / 10) * 10}s`;
}

function runtimeBand(runtime: number | null): string | null {
  if (runtime == null || runtime <= 0) return null;
  if (runtime < 90) return "under_90";
  if (runtime < 120) return "90_120";
  if (runtime < 150) return "120_150";

  return "over_150";
}

function awardKeys(film: FilmFeatureRow): string[] {
  const keys: string[] = [];

  for (const body of AWARD_BODIES) {
    if (film[body.wins] > 0) keys.push(`${body.key}_winner`);
    else if (film[body.nominations] > 0) keys.push(`${body.key}_nominee`);
  }

  return keys;
}

function ratingTierKeys(film: FilmFeatureRow): string[] {
  const keys: string[] = [];

  if (film.imdbRating != null) keys.push(`imdb_${Math.floor(film.imdbRating)}`);
  if (film.rtScore != null) keys.push(`rt_${Math.floor(film.rtScore / 10) * 10}`);

  return keys;
}
