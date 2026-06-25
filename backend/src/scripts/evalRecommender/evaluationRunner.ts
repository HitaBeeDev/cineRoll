import { BASELINE_PARAMS, type RecommenderParams } from "../../lib/experiments";
import { evaluateUser } from "./userEvaluator";
import type { EvaluationRun, UserMetrics } from "./types";

export async function evaluateUsers(
  userIds: string[],
  kValues: number[],
  maxK: number,
  maxUsers: number | null,
  params: RecommenderParams = BASELINE_PARAMS,
): Promise<EvaluationRun> {
  const results: UserMetrics[] = [];
  let skipped = 0;

  for (const id of userIds) {
    if (maxUsers !== null && results.length >= maxUsers) break;
    const metrics = await evaluateUser(id, kValues, maxK, params);
    if (metrics) results.push(metrics);
    else skipped++;
  }

  return { results, skipped };
}
