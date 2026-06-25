/**
 * Load-check for the hot read endpoints (checklist §13 / Targets appendix).
 *
 * Fires a fixed number of requests at a given concurrency against a *running*
 * server with the full dataset, then reports latency percentiles and pass/fail
 * against the documented targets.
 *
 * Run:
 *   npx tsx src/scripts/loadCheck.ts --base=http://localhost:4000 --requests=500 --concurrency=20
 *   npx tsx src/scripts/loadCheck.ts --token=<jwt>
 */
import { parseArgs } from "./loadCheck/args";
import {
  printHeader,
  printScenarioResult,
  printSkippedScenario,
  printTableHeader,
  printVerdict,
} from "./loadCheck/reporter";
import { runScenario } from "./loadCheck/scenarioRunner";
import { SCENARIOS } from "./loadCheck/scenarios";

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  printHeader(args);
  printTableHeader();

  let anyFail = false;
  for (const scenario of SCENARIOS) {
    if (scenario.auth && !args.token) {
      printSkippedScenario(scenario);
      continue;
    }

    const result = await runScenario(args, scenario);
    if (!result.pass) anyFail = true;
    printScenarioResult(result);
  }

  printVerdict(anyFail);
  process.exitCode = anyFail ? 1 : 0;
}

void main();
