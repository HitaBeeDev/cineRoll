import { prisma } from "../prisma";
import { buildIdf, IdfTable } from "./tfidf";

// Catalog-wide IDF, computed once and memoized. Rarity should be measured
// against the whole library (~4k films), not the handful being ranked, so
// "Drama" is correctly common and "Film-Noir" correctly rare. Recomputed at
// most once per TTL; a full-catalog scan of a few fields is cheap and the seed
// changes rarely.

const IDF_TTL_MS = 60 * 60 * 1000; // 1 hour

const idfSelect = {
  genres: true,
  director: true,
  releaseYear: true,
  oscarWins: true,
  oscarNominations: true,
  ggWins: true,
  ggNominations: true,
  cannesWins: true,
  cannesNominations: true,
  berlinWins: true,
  berlinNominations: true,
} as const;

let cache: { table: IdfTable; builtAt: number } | null = null;
let inFlight: Promise<IdfTable> | null = null;

export async function getCatalogIdf(): Promise<IdfTable> {
  if (cache && Date.now() - cache.builtAt < IDF_TTL_MS) return cache.table;
  if (inFlight) return inFlight; // collapse concurrent rebuilds into one query

  inFlight = buildCatalogIdf().finally(() => {
    inFlight = null;
  });

  return inFlight;
}

async function buildCatalogIdf(): Promise<IdfTable> {
  const films = await prisma.film.findMany({ select: idfSelect });
  const table = buildIdf(films);
  cache = { table, builtAt: Date.now() };

  return table;
}

// Test/seed hook — drop the memoized table (e.g. after reseeding).
export function resetCatalogIdfCache(): void {
  cache = null;
  inFlight = null;
}
