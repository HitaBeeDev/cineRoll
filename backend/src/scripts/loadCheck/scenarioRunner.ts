import { timeRequest } from "./httpClient";
import { summarizeScenario } from "./scenarioMetrics";
import type { LoadCheckArgs, Scenario, ScenarioResult, TimedResponse } from "./types";

const WARMUP_MAX_REQUESTS = 10;

export async function runScenario(
  args: LoadCheckArgs,
  scenario: Scenario,
): Promise<ScenarioResult> {
  const context = createScenarioContext(args, scenario);
  await warmScenario(context.url, context.headers, args.concurrency);

  const measured = await measureScenario(context.url, context.headers, args.requests, args.concurrency);

  return summarizeScenario(
    scenario,
    measured.latencies,
    measured.errors,
    args.requests,
    measured.wallMs,
  );
}

function createScenarioContext(args: LoadCheckArgs, scenario: Scenario) {
  const headers = scenario.auth && args.token ? { authorization: `Bearer ${args.token}` } : {};
  return { url: `${args.base}${scenario.path}`, headers };
}

async function warmScenario(
  url: string,
  headers: Record<string, string>,
  concurrency: number,
): Promise<void> {
  for (let i = 0; i < Math.min(WARMUP_MAX_REQUESTS, concurrency); i++) {
    await timeRequest(url, headers);
  }
}

async function measureScenario(
  url: string,
  headers: Record<string, string>,
  requests: number,
  concurrency: number,
) {
  const results = createResultCollector();
  let next = 0;

  async function worker(): Promise<void> {
    while (next < requests) {
      next += 1;
      results.record(await timeRequest(url, headers));
    }
  }

  const start = performance.now();
  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  return { ...results.value(), wallMs: performance.now() - start };
}

function createResultCollector() {
  const latencies: number[] = [];
  let errors = 0;

  return {
    record(result: TimedResponse) {
      if (result.ok) latencies.push(result.ms);
      else errors += 1;
    },
    value() {
      return { latencies, errors };
    },
  };
}
