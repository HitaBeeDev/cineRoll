/**
 * Offline evaluation harness for the content-based recommender (section 12).
 *
 * Leave-most-recent-out protocol, per test user:
 *   1. Take their liked films, ordered by recency.
 *   2. Hold out the most-recent few as ground truth.
 *   3. Rebuild the taste profile from the *remaining* signals only (using the
 *      live builder's own math via `aggregateTasteVectors`).
 *   4. Generate the candidate pool with the held-out films left eligible, then
 *      rank it with the production scorer (`rankCandidates`).
 *   5. Measure recall@k / precision@k / MRR for whether the held-out films are
 *      surfaced.
 *
 * It reuses the real pipeline pieces (no reimplementation) so the numbers
 * reflect what ships. Read-only: it never mutates the database.
 *
 * Run: `npx tsx src/scripts/evalRecommender.ts [--max-users=N] [--k=5,10,20]`
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { prisma } from "../lib/prisma";
import { BASELINE_PARAMS, type RecommenderParams } from "../lib/experiments";
import { generateCandidatePool, rankCandidates, MODEL_VERSION } from "../lib/recommender";
import { aggregateTasteVectors, filmFeatureSelect, type Signal } from "../lib/tasteProfile";
import { SIGNAL_WEIGHT, ratingWeight, sentimentWeight } from "../lib/tasteWeights";

/** Where per-modelVersion results are recorded for cross-version comparison. */
const RESULTS_PATH = resolve(process.cwd(), "eval-results/recommender.json");

// ── Protocol knobs ───────────────────────────────────────────────────────────
/** A user needs at least this many liked films to be a valid test case. */
const MIN_LIKED = 5;
/** Fraction of a user's liked films to hold out (capped by HOLDOUT_MAX). */
const HOLDOUT_FRACTION = 0.3;
const HOLDOUT_MAX = 5;
/** Mirror the recommender's cold-start gate: below this, it serves nothing. */
const COLD_START_MIN = 3;
const DEFAULT_K_VALUES = [5, 10, 20];

type Args = { maxUsers: number | null; kValues: number[]; mmrLambdas: number[] | null };

function parseArgs(argv: string[]): Args {
  let maxUsers: number | null = null;
  let kValues = DEFAULT_K_VALUES;
  let mmrLambdas: number[] | null = null;
  for (const arg of argv) {
    const users = arg.match(/^--max-users=(\d+)$/);
    if (users) maxUsers = Number(users[1]);
    const k = arg.match(/^--k=([\d,]+)$/);
    if (k) kValues = k[1]!.split(",").map(Number).filter(n => n > 0);
    // A/B sweep: evaluate each listed MMR lambda as a separate arm.
    const l = arg.match(/^--mmr-lambda=([\d.,]+)$/);
    if (l) mmrLambdas = l[1]!.split(",").map(Number).filter(n => n >= 0 && n <= 1);
  }
  return { maxUsers, kValues, mmrLambdas };
}

type WatchedRow = {
  filmId: string;
  sentiment: "like" | "dislike" | null;
  doNotSuggest: boolean;
  watchedAt: Date;
  film: Signal["film"];
};

type RatingRow = {
  filmId: string;
  rating: number;
  updatedAt: Date;
  film: Signal["film"];
};

type UserMetrics = {
  recall: Record<number, number>;
  precision: Record<number, number>;
  reciprocalRank: number;
};

/** Evaluate one user; returns null when they're not a valid test case. */
async function evaluateUser(
  userId: string,
  kValues: number[],
  maxK: number,
  params: RecommenderParams = BASELINE_PARAMS,
): Promise<UserMetrics | null> {
  const [watched, watchlist, ratings, user] = await Promise.all([
    prisma.watchedFilm.findMany({
      where: { userId },
      select: {
        filmId: true,
        sentiment: true,
        doNotSuggest: true,
        watchedAt: true,
        film: { select: filmFeatureSelect },
      },
    }),
    prisma.watchlist.findMany({
      where: { userId },
      select: { filmId: true, addedAt: true, film: { select: filmFeatureSelect } },
    }),
    prisma.userRating.findMany({
      where: { userId },
      select: {
        filmId: true,
        rating: true,
        updatedAt: true,
        film: { select: filmFeatureSelect },
      },
    }),
    prisma.user.findUnique({ where: { id: userId }, select: { onboardingGenres: true } }),
  ]);

  const positiveRows = [
    ...(watched as WatchedRow[])
      .filter(w => w.sentiment === "like" && !w.doNotSuggest)
      .map(w => ({ filmId: w.filmId, at: w.watchedAt })),
    ...(ratings as RatingRow[])
      .filter(r => ratingWeight(r.rating) > 0)
      .map(r => ({ filmId: r.filmId, at: r.updatedAt })),
  ].sort((a, b) => b.at.getTime() - a.at.getTime());

  const liked = Array.from(
    new Map(positiveRows.map(row => [row.filmId, row])).values(),
  );

  if (liked.length < MIN_LIKED) return null;

  const holdoutCount = Math.max(
    1,
    Math.min(HOLDOUT_MAX, Math.floor(liked.length * HOLDOUT_FRACTION)),
  );
  const heldOutIds = new Set(liked.slice(0, holdoutCount).map(w => w.filmId));

  // Rebuild taste from everything EXCEPT the held-out liked films.
  const signals: Signal[] = [];
  const ratingsByFilmId = new Map((ratings as RatingRow[]).map(rating => [rating.filmId, rating]));
  const consumedRatingFilmIds = new Set<string>();

  for (const w of watched as WatchedRow[]) {
    if (heldOutIds.has(w.filmId)) continue;
    const rating = ratingsByFilmId.get(w.filmId);
    if (rating) consumedRatingFilmIds.add(w.filmId);
    const weight = w.doNotSuggest
      ? SIGNAL_WEIGHT.notInterested
      : rating
        ? ratingWeight(rating.rating)
        : sentimentWeight(w.sentiment);
    signals.push({ film: w.film, weight, at: rating?.updatedAt ?? w.watchedAt });
  }
  for (const rating of ratings as RatingRow[]) {
    if (heldOutIds.has(rating.filmId)) continue;
    if (consumedRatingFilmIds.has(rating.filmId)) continue;
    signals.push({ film: rating.film, weight: ratingWeight(rating.rating), at: rating.updatedAt });
  }
  for (const entry of watchlist) {
    signals.push({ film: entry.film, weight: SIGNAL_WEIGHT.watchlistAdd, at: entry.addedAt });
  }

  const onboardingGenres = user?.onboardingGenres ?? [];
  const taste = aggregateTasteVectors(signals, onboardingGenres);

  // Skip cold-start users the recommender wouldn't serve anyway.
  if (taste.positiveCount < COLD_START_MIN && onboardingGenres.length === 0) return null;

  // Exclude everything the user has touched EXCEPT the held-out films, so the
  // held-out films are eligible to be surfaced (the thing we're measuring).
  const excludedIds = [
    ...new Set([
      ...watched.map(w => w.filmId),
      ...watchlist.map(w => w.filmId),
    ]),
  ].filter(id => !heldOutIds.has(id));

  const candidates = await generateCandidatePool(excludedIds, taste);
  const rankedIds = rankCandidates(candidates, taste, maxK, new Date().getFullYear(), params)
    .map(r => r.film.id);

  const recall: Record<number, number> = {};
  const precision: Record<number, number> = {};
  for (const k of kValues) {
    const topK = rankedIds.slice(0, k);
    const hits = topK.filter(id => heldOutIds.has(id)).length;
    recall[k] = hits / heldOutIds.size;
    precision[k] = hits / k;
  }

  const firstHit = rankedIds.findIndex(id => heldOutIds.has(id));
  const reciprocalRank = firstHit >= 0 ? 1 / (firstHit + 1) : 0;

  return { recall, precision, reciprocalRank };
}

function mean(values: number[]): number {
  return values.length === 0 ? 0 : values.reduce((a, b) => a + b, 0) / values.length;
}

// ── Per-modelVersion result store ────────────────────────────────────────────

type EvalRecord = {
  modelVersion: string;
  ranAt: string;
  usersEvaluated: number;
  usersSkipped: number;
  recall: Record<string, number>;
  precision: Record<string, number>;
  mrr: number;
};

function loadRecords(): EvalRecord[] {
  try {
    const parsed = JSON.parse(readFileSync(RESULTS_PATH, "utf8"));
    return Array.isArray(parsed) ? (parsed as EvalRecord[]) : [];
  } catch {
    return []; // first run, or unreadable — start fresh
  }
}

/** Upsert this run's record by modelVersion (latest run per version wins). */
function saveRecord(record: EvalRecord): EvalRecord[] {
  const records = loadRecords().filter(r => r.modelVersion !== record.modelVersion);
  records.push(record);
  records.sort((a, b) => a.modelVersion.localeCompare(b.modelVersion));
  mkdirSync(dirname(RESULTS_PATH), { recursive: true });
  writeFileSync(RESULTS_PATH, JSON.stringify(records, null, 2) + "\n");
  return records;
}

/** Side-by-side comparison of every recorded modelVersion, so a change can be
 *  judged apples-to-apples against the versions before it. */
function printComparison(records: EvalRecord[], kValues: number[]): void {
  const primaryK = Math.max(...kValues);
  console.log("Comparison across model versions:");
  console.log(`  version        users   MRR      recall@${primaryK}   precision@${primaryK}`);
  for (const r of records) {
    const recall = (r.recall[String(primaryK)] ?? 0).toFixed(4);
    const precision = (r.precision[String(primaryK)] ?? 0).toFixed(4);
    const marker = r.modelVersion === MODEL_VERSION ? "→" : " ";
    console.log(
      `${marker} ${r.modelVersion.padEnd(14)} ${String(r.usersEvaluated).padEnd(7)} ` +
        `${r.mrr.toFixed(4)}   ${recall.padEnd(9)} ${precision}`,
    );
  }
  console.log("");
}

/** A/B sweep: evaluate the same users under each MMR lambda and print the arms
 *  side by side. Same protocol as the single run, so arms are comparable. */
async function runAbSweep(
  userIds: string[],
  kValues: number[],
  maxK: number,
  maxUsers: number | null,
  lambdas: number[],
): Promise<void> {
  const primaryK = Math.max(...kValues);
  console.log(`\nRecommender A/B sweep — model ${MODEL_VERSION}, MMR lambda arms: ${lambdas.join(", ")}`);
  console.log(`Protocol: leave-most-recent-${HOLDOUT_MAX}-out · cold-start gate ${COLD_START_MIN}\n`);
  console.log(`  mmrLambda   users   MRR      recall@${primaryK}   precision@${primaryK}`);

  for (const lambda of lambdas) {
    const params: RecommenderParams = { ...BASELINE_PARAMS, mmrLambda: lambda };
    const results: UserMetrics[] = [];
    for (const id of userIds) {
      if (maxUsers !== null && results.length >= maxUsers) break;
      const metrics = await evaluateUser(id, kValues, maxK, params);
      if (metrics) results.push(metrics);
    }
    const mrr = mean(results.map(m => m.reciprocalRank));
    const recall = mean(results.map(m => m.recall[primaryK] ?? 0));
    const precision = mean(results.map(m => m.precision[primaryK] ?? 0));
    console.log(
      `  ${lambda.toFixed(2).padEnd(11)} ${String(results.length).padEnd(7)} ` +
        `${mrr.toFixed(4)}   ${recall.toFixed(4).padEnd(9)} ${precision.toFixed(4)}`,
    );
  }
  console.log("");
}

async function main(): Promise<void> {
  const { maxUsers, kValues, mmrLambdas } = parseArgs(process.argv.slice(2));
  const maxK = Math.max(...kValues);

  const users = await prisma.user.findMany({ select: { id: true } });

  if (mmrLambdas && mmrLambdas.length > 0) {
    await runAbSweep(users.map(u => u.id), kValues, maxK, maxUsers, mmrLambdas);
    return;
  }

  const results: UserMetrics[] = [];
  let skipped = 0;

  for (const { id } of users) {
    if (maxUsers !== null && results.length >= maxUsers) break;
    const metrics = await evaluateUser(id, kValues, maxK);
    if (metrics) results.push(metrics);
    else skipped++;
  }

  console.log(`\nRecommender offline evaluation — model ${MODEL_VERSION}`);
  console.log(`Protocol: leave-most-recent-${HOLDOUT_MAX}-out · cold-start gate ${COLD_START_MIN}`);
  console.log(`Users: ${results.length} evaluated, ${skipped} skipped (too few signals)\n`);

  if (results.length === 0) {
    console.log("No eligible test users — need users with rated likes to evaluate.");
    return;
  }

  const recall: Record<string, number> = {};
  const precision: Record<string, number> = {};
  console.log("  k    recall@k   precision@k");
  for (const k of kValues) {
    const r = mean(results.map(m => m.recall[k] ?? 0));
    const p = mean(results.map(m => m.precision[k] ?? 0));
    recall[String(k)] = r;
    precision[String(k)] = p;
    console.log(`  ${String(k).padEnd(4)} ${r.toFixed(4).padEnd(10)} ${p.toFixed(4)}`);
  }
  const mrr = mean(results.map(m => m.reciprocalRank));
  console.log(`\n  MRR: ${mrr.toFixed(4)}\n`);

  // Record this run under its modelVersion and show it next to prior versions.
  const records = saveRecord({
    modelVersion: MODEL_VERSION,
    ranAt: new Date().toISOString(),
    usersEvaluated: results.length,
    usersSkipped: skipped,
    recall,
    precision,
    mrr,
  });
  console.log(`Saved results for ${MODEL_VERSION} → ${RESULTS_PATH}\n`);
  printComparison(records, kValues);
}

main()
  .catch(err => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => void prisma.$disconnect());
