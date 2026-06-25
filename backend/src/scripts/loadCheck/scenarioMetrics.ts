import type { Scenario, ScenarioResult } from "./types";

const MAX_ERROR_RATE = 0.01;

export function summarizeScenario(
  scenario: Scenario,
  latencies: number[],
  errors: number,
  requestCount: number,
  wallMs: number,
): ScenarioResult {
  const sorted = [...latencies].sort((a, b) => a - b);
  const p95 = percentile(sorted, 95);
  const errorRate = errors / requestCount;

  return {
    scenario,
    p50: percentile(sorted, 50),
    p95,
    p99: percentile(sorted, 99),
    rps: (sorted.length / wallMs) * 1000,
    errors,
    n: sorted.length,
    pass: sorted.length > 0 && p95 <= scenario.targetMs && errorRate < MAX_ERROR_RATE,
  };
}

function percentile(sorted: number[], percentileValue: number): number {
  if (sorted.length === 0) return 0;
  const index = Math.min(
    sorted.length - 1,
    Math.ceil((percentileValue / 100) * sorted.length) - 1,
  );
  return sorted[index]!;
}
