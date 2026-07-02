// Client-side storage keys and persistence helpers shared by the home page and
// its onboarding / roll-history components. Extracted from the former monolithic
// home page so each consumer imports only what it needs and these stay
// independently unit-testable. All access window/sessionStorage at call time and
// is only invoked from client components.
import type { RerollPenalty, RollFilm, TasteCardFilm } from "@/lib/api";

export const PENDING_WATCHED_STORAGE_KEY = "cineroll_pending_watched_films";
export const TASTE_SEED_STORAGE_KEY = "cineroll_taste_seed";
export const ROLL_HISTORY_STORAGE_KEY = "roll_history";
export const MAX_ROLL_HISTORY_ITEMS = 10;

// Shuffle-bag anti-repeat: film ids served this session. The roll excludes these
// so it doesn't repeat a title until the reachable pool is exhausted, then the
// bag resets. Kept in sessionStorage so a fresh tab/session starts clean.
export const ROLL_SEEN_STORAGE_KEY = "cineroll_roll_seen";
// Cap the bag: it rides in the request query string, so an unbounded list over a
// multi-thousand-film pool would blow past URL limits. For narrow filter sets
// (pool < cap) this still covers the whole pool — true shuffle-bag behavior with
// a reset; for the broad pool it degrades to a sliding "don't repeat recently"
// window, which captures nearly all of the perceived benefit.
export const MAX_ROLL_SEEN_IDS = 100;

export type PendingWatchedFilm = {
  filmId: string;
  watchedAt: string;
  source: "onboarding";
  synced: false;
};

export type TasteSeed = {
  source: "onboarding";
  filmIds: string[];
  genres: string[];
  primaryGenre: string | null;
  createdAt: string;
};

export function savePendingWatchedFilms(filmIds: string[]) {
  if (filmIds.length === 0) return;

  try {
    const existing = JSON.parse(
      window.localStorage.getItem(PENDING_WATCHED_STORAGE_KEY) ?? "[]",
    ) as Partial<PendingWatchedFilm>[];
    const byFilmId = new Map<string, PendingWatchedFilm>();

    for (const item of existing) {
      if (typeof item.filmId !== "string") continue;
      byFilmId.set(item.filmId, {
        filmId: item.filmId,
        watchedAt:
          typeof item.watchedAt === "string"
            ? item.watchedAt
            : new Date().toISOString(),
        source: "onboarding",
        synced: false,
      });
    }

    const watchedAt = new Date().toISOString();
    for (const filmId of filmIds) {
      byFilmId.set(filmId, {
        filmId,
        watchedAt,
        source: "onboarding",
        synced: false,
      });
    }

    window.localStorage.setItem(
      PENDING_WATCHED_STORAGE_KEY,
      JSON.stringify([...byFilmId.values()]),
    );
  } catch {
    // If storage is unavailable, onboarding should still be completable.
  }
}

export function createTasteSeed(
  films: TasteCardFilm[],
  selectedFilmIds: string[],
): TasteSeed | null {
  if (selectedFilmIds.length === 0) return null;

  const selectedIds = new Set(selectedFilmIds);
  const selectedFilms = films.filter((film) => selectedIds.has(film.id));
  if (selectedFilms.length === 0) return null;

  const genreCounts = new Map<string, number>();
  for (const film of selectedFilms) {
    for (const genre of film.genres) {
      genreCounts.set(genre, (genreCounts.get(genre) ?? 0) + 1);
    }
  }

  const genres = [...genreCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([genre]) => genre);

  return {
    source: "onboarding",
    filmIds: selectedFilmIds,
    genres,
    primaryGenre: genres[0] ?? null,
    createdAt: new Date().toISOString(),
  };
}

export function saveTasteSeed(seed: TasteSeed | null) {
  if (!seed) return;

  try {
    window.localStorage.setItem(TASTE_SEED_STORAGE_KEY, JSON.stringify(seed));
  } catch {
    // If storage is unavailable, onboarding should still be completable.
  }
}

/** Film ids already served this session (most-recent last), for anti-repeat. */
export function getRolledBag(): string[] {
  try {
    const raw = window.sessionStorage.getItem(ROLL_SEEN_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

/** Record a served film, keeping the bag de-duped and capped to the most recent. */
export function addToRolledBag(filmId: string): void {
  try {
    const bag = getRolledBag().filter((id) => id !== filmId);
    bag.push(filmId);
    const capped = bag.slice(-MAX_ROLL_SEEN_IDS);
    window.sessionStorage.setItem(ROLL_SEEN_STORAGE_KEY, JSON.stringify(capped));
  } catch {
    // Anti-repeat is a nicety; rolling must keep working if storage is blocked.
  }
}

/** Empty the bag — used when the session has exhausted the reachable pool. */
export function resetRolledBag(): void {
  try {
    window.sessionStorage.removeItem(ROLL_SEEN_STORAGE_KEY);
  } catch {
    // non-critical
  }
}

// Reroll-learning session state (docs/smart-roll-engine.md §6). Accumulated
// weak-negative weights per main-genre / content-type from titles the user
// skipped this session. Held in sessionStorage (fresh per tab), decayed once per
// roll so a skipped kind is avoided for "the next few rolls" then recovers — a
// mood signal, not a permanent dislike. Sent to the backend each roll.
export const REROLL_PENALTY_STORAGE_KEY = "cineroll_reroll_penalty";
// A plain reroll (skipped without engaging) vs a manual "Not interested" reject.
export const REROLL_WEAK_PENALTY = 1;
export const REROLL_STRONG_PENALTY = 2.5;
// Per-roll decay + the floor below which a penalty is dropped, and a cap so a
// repeatedly-skipped kind can't accumulate unbounded weight.
export const REROLL_DECAY = 0.5;
export const REROLL_MIN_PENALTY = 0.15;
export const REROLL_MAX_PENALTY = 6;

function emptyRerollPenalty(): RerollPenalty {
  return { genre: {}, contentType: {} };
}

export function getRerollPenalty(): RerollPenalty {
  try {
    const raw = window.sessionStorage.getItem(REROLL_PENALTY_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<RerollPenalty>) : null;
    return {
      genre: sanitizeWeights(parsed?.genre),
      contentType: sanitizeWeights(parsed?.contentType),
    };
  } catch {
    return emptyRerollPenalty();
  }
}

function sanitizeWeights(value: unknown): Record<string, number> {
  if (!value || typeof value !== "object") return {};
  const out: Record<string, number> = {};
  for (const [key, weight] of Object.entries(value as Record<string, unknown>)) {
    if (typeof weight === "number" && Number.isFinite(weight) && weight > 0) out[key] = weight;
  }
  return out;
}

function writeRerollPenalty(penalty: RerollPenalty): void {
  try {
    window.sessionStorage.setItem(REROLL_PENALTY_STORAGE_KEY, JSON.stringify(penalty));
  } catch {
    // Reroll learning is a nicety; rolling must keep working if storage is blocked.
  }
}

function decayMap(weights: Record<string, number>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [key, weight] of Object.entries(weights)) {
    const next = weight * REROLL_DECAY;
    if (next >= REROLL_MIN_PENALTY) out[key] = next;
  }
  return out;
}

/** Fade every accumulated penalty by one roll; drop those that reach the floor. */
export function decayRerollPenalties(): void {
  const penalty = getRerollPenalty();
  writeRerollPenalty({
    genre: decayMap(penalty.genre),
    contentType: decayMap(penalty.contentType),
  });
}

function bump(weights: Record<string, number>, key: string, amount: number): void {
  weights[key] = Math.min((weights[key] ?? 0) + amount, REROLL_MAX_PENALTY);
}

/**
 * Record a skip against a film's main genre + content type. `strength` is
 * "weak" for a plain reroll (maybe just not in the mood) or "strong" for an
 * explicit "Not interested" reject.
 */
export function addRerollPenalty(film: RollFilm, strength: "weak" | "strong"): void {
  const amount = strength === "strong" ? REROLL_STRONG_PENALTY : REROLL_WEAK_PENALTY;
  const penalty = getRerollPenalty();
  const genre = film.genres[0];
  if (genre) bump(penalty.genre, genre, amount);
  if (film.contentType) bump(penalty.contentType, film.contentType, amount);
  writeRerollPenalty(penalty);
}

export function resetRerollPenalty(): void {
  try {
    window.sessionStorage.removeItem(REROLL_PENALTY_STORAGE_KEY);
  } catch {
    // non-critical
  }
}

// Lane-bandit posteriors (docs/smart-roll-engine.md §6b). The Beta(α, β) state
// for the roll's three lanes (Safe / Gem / Wild), learned from whether the user
// engaged with each lane's picks. Sent to the backend each roll, where Thompson
// sampling uses it to choose the lane; updated here on engagement/skip. Held in
// localStorage (NOT sessionStorage) so the roll keeps learning the user across
// visits. Mirrors backend `randomRoute/bandit.ts` — keep the constants in sync.
export const LANE_BANDIT_STORAGE_KEY = "cineroll_lane_bandit";
export type BanditLane = "safe" | "gem" | "wild";
export type BetaArm = { alpha: number; beta: number };
export type LaneBandit = Record<BanditLane, BetaArm>;

// Cold-start priors reproduce the old fixed 70/20/10 lean; modest strength lets
// real engagement move them. Must match backend PRIOR_POSTERIORS.
const LANE_BANDIT_PRIORS: LaneBandit = {
  safe: { alpha: 4, beta: 2 },
  gem: { alpha: 2, beta: 4 },
  wild: { alpha: 1, beta: 3 },
};
// Sliding-memory cap on an arm's evidence, so the bandit keeps adapting. Must
// match backend MAX_ARM_STRENGTH.
const LANE_BANDIT_MAX_STRENGTH = 60;
const LANE_BANDIT_LANES: BanditLane[] = ["safe", "gem", "wild"];

function clonePriors(): LaneBandit {
  return {
    safe: { ...LANE_BANDIT_PRIORS.safe },
    gem: { ...LANE_BANDIT_PRIORS.gem },
    wild: { ...LANE_BANDIT_PRIORS.wild },
  };
}

function sanitizeArm(value: unknown): BetaArm | null {
  if (!value || typeof value !== "object") return null;
  const { alpha, beta } = value as Record<string, unknown>;
  if (typeof alpha !== "number" || typeof beta !== "number") return null;
  if (!Number.isFinite(alpha) || !Number.isFinite(beta) || alpha <= 0 || beta <= 0) return null;
  return { alpha, beta };
}

export function getLaneBandit(): LaneBandit {
  try {
    const raw = window.localStorage.getItem(LANE_BANDIT_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<Record<BanditLane, unknown>>) : null;
    const bandit = clonePriors();
    for (const lane of LANE_BANDIT_LANES) {
      const arm = sanitizeArm(parsed?.[lane]);
      if (arm) bandit[lane] = arm;
    }
    return bandit;
  } catch {
    return clonePriors();
  }
}

/**
 * Overwrite the local posteriors with an authoritative copy — used to sync from
 * the DB-stored state the backend returns for signed-in users, so their learned
 * bandit follows them across devices instead of diverging per browser.
 */
export function setLaneBandit(bandit: LaneBandit): void {
  const safe = sanitizeArm(bandit?.safe);
  const gem = sanitizeArm(bandit?.gem);
  const wild = sanitizeArm(bandit?.wild);
  if (!safe || !gem || !wild) return;

  try {
    window.localStorage.setItem(LANE_BANDIT_STORAGE_KEY, JSON.stringify({ safe, gem, wild }));
  } catch {
    // Non-critical sync; rolling keeps working if storage is blocked.
  }
}

/**
 * Fold a reward for the lane that was served into its posterior — `1` when the
 * user engaged (opened / saved / watched), `0` on a skip. Same update rule as
 * backend `updateArm`: α += reward, β += (1 − reward), then shrink toward the
 * cap so the posterior keeps a sliding memory.
 */
export function updateLaneBandit(lane: BanditLane, reward: number): void {
  const clamped = reward < 0 ? 0 : reward > 1 ? 1 : reward;
  const bandit = getLaneBandit();
  const arm = bandit[lane];
  let alpha = arm.alpha + clamped;
  let beta = arm.beta + (1 - clamped);

  const strength = alpha + beta;
  if (strength > LANE_BANDIT_MAX_STRENGTH) {
    const scale = LANE_BANDIT_MAX_STRENGTH / strength;
    alpha *= scale;
    beta *= scale;
  }

  bandit[lane] = { alpha, beta };
  try {
    window.localStorage.setItem(LANE_BANDIT_STORAGE_KEY, JSON.stringify(bandit));
  } catch {
    // Lane learning is a nicety; rolling must keep working if storage is blocked.
  }
}

export function pushRollHistory(film: RollFilm) {
  try {
    const existing = JSON.parse(
      window.sessionStorage.getItem(ROLL_HISTORY_STORAGE_KEY) ?? "[]",
    ) as RollFilm[];
    const deduped = existing.filter((item) => item?.id !== film.id);
    const next = [film, ...deduped].slice(0, MAX_ROLL_HISTORY_ITEMS);
    window.sessionStorage.setItem(
      ROLL_HISTORY_STORAGE_KEY,
      JSON.stringify(next),
    );
  } catch {
    // Session history is non-critical; rolling should keep working if storage is blocked.
  }
}
