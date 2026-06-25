import { BASELINE_PARAMS, type RecommenderParams } from "../../lib/experiments";
import { MODEL_VERSION } from "../../lib/recommender";
import { COLD_START_MIN, HOLDOUT_MAX } from "./config";
import { evaluateUser } from "./userEvaluator";
import { mean } from "./metricSummary";
import type { UserMetrics } from "./types";

export async function runAbSweep(
  userIds: string[],
  kValues: number[],
  maxK: number,
  maxUsers: number | null,
  lambdas: number[],
): Promise<void> {
  const primaryK = Math.max(...kValues);
  printSweepHeader(lambdas, primaryK);

  for (const lambda of lambdas) {
    const results = await evaluateSweepArm(userIds, kValues, maxK, maxUsers, lambda);
    printSweepRow(lambda, results, primaryK);
  }

  console.log("");
}

async function evaluateSweepArm(
  userIds: string[],
  kValues: number[],
  maxK: number,
  maxUsers: number | null,
  lambda: number,
): Promise<UserMetrics[]> {
  const params: RecommenderParams = { ...BASELINE_PARAMS, mmrLambda: lambda };
  const results: UserMetrics[] = [];

  for (const id of userIds) {
    if (maxUsers !== null && results.length >= maxUsers) break;
    const metrics = await evaluateUser(id, kValues, maxK, params);
    if (metrics) results.push(metrics);
  }

  return results;
}

function printSweepHeader(lambdas: number[], primaryK: number): void {
  console.log(`\nRecommender A/B sweep - model ${MODEL_VERSION}, MMR lambda arms: ${lambdas.join(", ")}`);
  console.log(`Protocol: leave-most-recent-${HOLDOUT_MAX}-out · cold-start gate ${COLD_START_MIN}\n`);
  console.log(`  mmrLambda   users   MRR      recall@${primaryK}   precision@${primaryK}`);
}

function printSweepRow(lambda: number, results: UserMetrics[], primaryK: number): void {
  const mrr = mean(results.map(metric => metric.reciprocalRank));
  const recall = mean(results.map(metric => metric.recall[primaryK] ?? 0));
  const precision = mean(results.map(metric => metric.precision[primaryK] ?? 0));

  console.log(
    `  ${lambda.toFixed(2).padEnd(11)} ${String(results.length).padEnd(7)} ` +
      `${mrr.toFixed(4)}   ${recall.toFixed(4).padEnd(9)} ${precision.toFixed(4)}`,
  );
}
