import { PICK_OF_DAY_CONFIG } from "./constants";
import { seededUnit } from "./seed";
import { PoolRow } from "./types";

// Pick-of-day scorer: fully deterministic for a given (pool, dateKey) — no RNG,
// so every server instance and every request on the same day agrees on the pick
// without coordination. score = quality + underExposure + daily seeded jitter:
//   quality        prestige normalized within TODAY'S pool (min–max), so the
//                  scale adapts as the eligible pool shrinks over the year.
//   underExposure  favors films the roll has surfaced least recently — the pick
//                  spotlights the catalog's corners instead of re-crowning hits.
//   seed           per-(day, film) hash jitter, the only thing that changes day
//                  to day — it rotates which of the many good candidates wins.

type PoolStats = {
  maxPrestige: number;
  maxRolls: number;
  minPrestige: number;
  prestigeRange: number;
};

type ScoredFilm = {
  id: string;
  score: number;
};

export function selectFromPool(pool: PoolRow[], dateKey: string): string | null {
  if (pool.length === 0) return null;

  const stats = summarizePool(pool);
  return pool.reduce<ScoredFilm | null>((best, film) => {
    const candidate = scoreFilm(film, stats, dateKey);
    return isBetterCandidate(candidate, best) ? candidate : best;
  }, null)?.id ?? null;
}

function summarizePool(pool: PoolRow[]): PoolStats {
  let minPrestige = Infinity;
  let maxPrestige = -Infinity;
  let maxRolls = 0;

  for (const film of pool) {
    minPrestige = Math.min(minPrestige, film.prestige);
    maxPrestige = Math.max(maxPrestige, film.prestige);
    maxRolls = Math.max(maxRolls, film.rollCount);
  }

  return {
    maxPrestige,
    maxRolls,
    minPrestige,
    prestigeRange: maxPrestige - minPrestige || 1,
  };
}

function scoreFilm(film: PoolRow, stats: PoolStats, dateKey: string): ScoredFilm {
  const quality = (film.prestige - stats.minPrestige) / stats.prestigeRange;
  const underExposure = stats.maxRolls > 0 ? 1 - film.rollCount / stats.maxRolls : 1;
  const seed = seededUnit(`${dateKey}:${film.id}`);
  const score =
    quality +
    PICK_OF_DAY_CONFIG.weightUnderExposure * underExposure +
    PICK_OF_DAY_CONFIG.weightDailySeed * seed;

  return { id: film.id, score };
}

// Ties break by lowest id so equal scores still resolve identically everywhere.
function isBetterCandidate(candidate: ScoredFilm, best: ScoredFilm | null): boolean {
  return best === null || candidate.score > best.score || (
    candidate.score === best.score && candidate.id < best.id
  );
}
