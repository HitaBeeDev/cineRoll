import type { LoadCheckArgs, Scenario, ScenarioResult } from "./types";

export function printHeader(args: LoadCheckArgs): void {
  console.log(`\nLoad check -> ${args.base}`);
  console.log(`Requests: ${args.requests} per scenario · concurrency: ${args.concurrency}\n`);
}

export function printTableHeader(): void {
  console.log("  scenario                  n     p50      p95      p99     rps    target   result");
}

export function printSkippedScenario(scenario: Scenario): void {
  console.log(`  ${scenario.name.padEnd(24)} - skipped (no --token)`);
}

export function printScenarioResult(result: ScenarioResult): void {
  console.log(
    `  ${result.scenario.name.padEnd(24)} ${String(result.n).padEnd(5)} ` +
      `${formatMs(result.p50)} ${formatMs(result.p95)} ${formatMs(result.p99)} ` +
      `${result.rps.toFixed(0).padEnd(6)} <${result.scenario.targetMs}ms  ` +
      `${result.pass ? "PASS" : "FAIL"}${formatErrors(result.errors)}`,
  );
}

export function printVerdict(anyFail: boolean): void {
  const verdict = anyFail ? "FAIL - some scenario over target" : "PASS - all under target";
  console.log(`\nVerdict (by p95): ${verdict}\n`);
}

function formatMs(value: number): string {
  return `${value.toFixed(1)}ms`.padEnd(8);
}

function formatErrors(errors: number): string {
  return errors ? ` (${errors} err)` : "";
}
