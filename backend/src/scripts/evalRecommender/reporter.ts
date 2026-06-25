import { COLD_START_MIN, HOLDOUT_MAX, RESULTS_PATH } from "./config";
import type { EvalRecord } from "./types";
import { MODEL_VERSION } from "../../lib/recommender";

export function printRunIntro(evaluated: number, skipped: number): void {
  console.log(`\nRecommender offline evaluation - model ${MODEL_VERSION}`);
  console.log(`Protocol: leave-most-recent-${HOLDOUT_MAX}-out · cold-start gate ${COLD_START_MIN}`);
  console.log(`Users: ${evaluated} evaluated, ${skipped} skipped (too few signals)\n`);
}

export function printNoEligibleUsers(): void {
  console.log("No eligible test users - need users with rated likes to evaluate.");
}

export function printRunMetrics(record: EvalRecord, kValues: number[]): void {
  console.log("  k    recall@k   precision@k");
  for (const k of kValues) {
    const recall = record.recall[String(k)] ?? 0;
    const precision = record.precision[String(k)] ?? 0;
    console.log(`  ${String(k).padEnd(4)} ${recall.toFixed(4).padEnd(10)} ${precision.toFixed(4)}`);
  }
  console.log(`\n  MRR: ${record.mrr.toFixed(4)}\n`);
}

export function printSavedRecord(modelVersion: string): void {
  console.log(`Saved results for ${modelVersion} -> ${RESULTS_PATH}\n`);
}

export function printComparison(records: EvalRecord[], kValues: number[]): void {
  const primaryK = Math.max(...kValues);
  console.log("Comparison across model versions:");
  console.log(`  version        users   MRR      recall@${primaryK}   precision@${primaryK}`);

  for (const record of records) {
    printComparisonRow(record, primaryK);
  }

  console.log("");
}

function printComparisonRow(record: EvalRecord, primaryK: number): void {
  const recall = (record.recall[String(primaryK)] ?? 0).toFixed(4);
  const precision = (record.precision[String(primaryK)] ?? 0).toFixed(4);
  const marker = record.modelVersion === MODEL_VERSION ? ">" : " ";

  console.log(
    `${marker} ${record.modelVersion.padEnd(14)} ${String(record.usersEvaluated).padEnd(7)} ` +
      `${record.mrr.toFixed(4)}   ${recall.padEnd(9)} ${precision}`,
  );
}
