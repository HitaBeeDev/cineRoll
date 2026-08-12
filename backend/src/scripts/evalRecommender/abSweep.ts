import { BASELINE_PARAMS, type RecommenderParams } from "../../lib/experiments";
import { MODEL_VERSION } from "../../lib/recommender";
import { SENTIMENT_WEIGHT, type SentimentWeights } from "../../lib/tasteWeights";
import { COLD_START_MIN, HOLDOUT_MAX } from "./config";
import { evaluateUser } from "./userEvaluator";
import { mean } from "./metricSummary";
import type { UserMetrics } from "./types";

type SweepArm = {
  /** Printed in the leftmost column — the value being varied. */
  label: string;
  params: RecommenderParams;
  weights: SentimentWeights;
};

type SweepInputs = {
  userIds: string[];
  kValues: number[];
  maxK: number;
  maxUsers: number | null;
};

export async function runAbSweep(
  inputs: SweepInputs,
  lambdas: number[],
): Promise<void> {
  await runSweep(
    inputs,
    "mmrLambda",
    lambdas.map(lambda => ({
      label: lambda.toFixed(2),
      params: { ...BASELINE_PARAMS, mmrLambda: lambda },
      weights: SENTIMENT_WEIGHT,
    })),
  );
}

/**
 * Sweeps the love:like ratio. This is the arm set that decides what a "loved"
 * verdict is worth — see the note on SENTIMENT_WEIGHT. Everything else is held
 * at the live constants, so a metric delta is attributable to that ratio alone.
 *
 * The run is only meaningful once there are loved films in the database. With
 * none, every arm trains on identical signals and prints identical metrics —
 * which is itself the correct reading: there is nothing to fit yet.
 */
export async function runLoveWeightSweep(
  inputs: SweepInputs,
  loveWeights: number[],
): Promise<void> {
  await runSweep(
    inputs,
    "loveWeight",
    loveWeights.map(love => ({
      label: love.toFixed(2),
      params: BASELINE_PARAMS,
      weights: { ...SENTIMENT_WEIGHT, love },
    })),
  );
}

async function runSweep(
  inputs: SweepInputs,
  knob: string,
  arms: SweepArm[],
): Promise<void> {
  printSweepHeader(knob, arms, Math.max(...inputs.kValues));

  for (const arm of arms) {
    const results = await evaluateSweepArm(inputs, arm);
    printSweepRow(arm.label, results, Math.max(...inputs.kValues));
  }

  console.log("");
}

async function evaluateSweepArm(
  inputs: SweepInputs,
  arm: SweepArm,
): Promise<UserMetrics[]> {
  const results: UserMetrics[] = [];

  for (const id of inputs.userIds) {
    if (inputs.maxUsers !== null && results.length >= inputs.maxUsers) break;
    const metrics = await evaluateUser(
      id,
      inputs.kValues,
      inputs.maxK,
      arm.params,
      arm.weights,
    );
    if (metrics) results.push(metrics);
  }

  return results;
}

function printSweepHeader(knob: string, arms: SweepArm[], primaryK: number): void {
  const values = arms.map(arm => arm.label).join(", ");
  console.log(`\nRecommender A/B sweep - model ${MODEL_VERSION}, ${knob} arms: ${values}`);
  console.log(`Protocol: leave-most-recent-${HOLDOUT_MAX}-out · cold-start gate ${COLD_START_MIN}\n`);
  console.log(`  ${knob.padEnd(11)} users   MRR      recall@${primaryK}   precision@${primaryK}`);
}

function printSweepRow(label: string, results: UserMetrics[], primaryK: number): void {
  const mrr = mean(results.map(metric => metric.reciprocalRank));
  const recall = mean(results.map(metric => metric.recall[primaryK] ?? 0));
  const precision = mean(results.map(metric => metric.precision[primaryK] ?? 0));

  console.log(
    `  ${label.padEnd(11)} ${String(results.length).padEnd(7)} ` +
      `${mrr.toFixed(4)}   ${recall.toFixed(4).padEnd(9)} ${precision.toFixed(4)}`,
  );
}
