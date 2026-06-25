/**
 * Offline evaluation harness for the content-based recommender (section 12).
 *
 * Leave-most-recent-out protocol, per test user:
 *   1. Take their liked films, ordered by recency.
 *   2. Hold out the most-recent few as ground truth.
 *   3. Rebuild taste from the remaining signals using the live builder math.
 *   4. Generate the candidate pool with held-out films left eligible.
 *   5. Measure recall@k / precision@k / MRR for surfaced held-out films.
 *
 * Read-only: it never mutates the database except writing local eval results.
 *
 * Run: `npx tsx src/scripts/evalRecommender.ts [--max-users=N] [--k=5,10,20]`
 */
import { prisma } from "../lib/prisma";
import { MODEL_VERSION } from "../lib/recommender";
import { parseArgs } from "./evalRecommender/args";
import { evaluateUsers } from "./evalRecommender/evaluationRunner";
import { formatRunRecord } from "./evalRecommender/metricSummary";
import {
  printComparison,
  printNoEligibleUsers,
  printRunIntro,
  printRunMetrics,
  printSavedRecord,
} from "./evalRecommender/reporter";
import { saveRecord } from "./evalRecommender/resultStore";
import { getEvaluationUserIds } from "./evalRecommender/userSignalRepository";
import { runAbSweep } from "./evalRecommender/abSweep";

async function main(): Promise<void> {
  const { maxUsers, kValues, mmrLambdas } = parseArgs(process.argv.slice(2));
  const maxK = Math.max(...kValues);
  const userIds = await getEvaluationUserIds();

  if (mmrLambdas && mmrLambdas.length > 0) {
    await runAbSweep(userIds, kValues, maxK, maxUsers, mmrLambdas);
    return;
  }

  const run = await evaluateUsers(userIds, kValues, maxK, maxUsers);
  printRunIntro(run.results.length, run.skipped);

  if (run.results.length === 0) {
    printNoEligibleUsers();
    return;
  }

  const record = formatRunRecord(MODEL_VERSION, run, kValues);
  printRunMetrics(record, kValues);

  const records = saveRecord(record);
  printSavedRecord(MODEL_VERSION);
  printComparison(records, kValues);
}

main()
  .catch(err => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => void prisma.$disconnect());
