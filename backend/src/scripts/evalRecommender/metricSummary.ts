import type { EvalRecord, EvaluationRun, UserMetrics } from "./types";

export function scoreRanking(
  rankedIds: string[],
  heldOutIds: Set<string>,
  kValues: number[],
): UserMetrics {
  const recall: Record<number, number> = {};
  const precision: Record<number, number> = {};

  for (const k of kValues) {
    const hits = rankedIds.slice(0, k).filter(id => heldOutIds.has(id)).length;
    recall[k] = hits / heldOutIds.size;
    precision[k] = hits / k;
  }

  return {
    recall,
    precision,
    reciprocalRank: reciprocalRank(rankedIds, heldOutIds),
  };
}

export function formatRunRecord(
  modelVersion: string,
  run: EvaluationRun,
  kValues: number[],
): EvalRecord {
  const recall: Record<string, number> = {};
  const precision: Record<string, number> = {};

  for (const k of kValues) {
    recall[String(k)] = mean(run.results.map(metric => metric.recall[k] ?? 0));
    precision[String(k)] = mean(run.results.map(metric => metric.precision[k] ?? 0));
  }

  return {
    modelVersion,
    ranAt: new Date().toISOString(),
    usersEvaluated: run.results.length,
    usersSkipped: run.skipped,
    recall,
    precision,
    mrr: mean(run.results.map(metric => metric.reciprocalRank)),
  };
}

export function mean(values: number[]): number {
  return values.length === 0 ? 0 : values.reduce((a, b) => a + b, 0) / values.length;
}

function reciprocalRank(rankedIds: string[], heldOutIds: Set<string>): number {
  const firstHit = rankedIds.findIndex(id => heldOutIds.has(id));
  return firstHit >= 0 ? 1 / (firstHit + 1) : 0;
}
