/**
 * Load-check for the hot read endpoints (checklist §13 / Targets appendix).
 *
 * Fires a fixed number of requests at a given concurrency against a *running*
 * server with the full dataset, then reports latency percentiles and pass/fail
 * against the documented targets:
 *   - random  < 200 ms
 *   - browse  < 200 ms
 *   - recommendations < 150 ms warm (cached)   [needs --token]
 *
 * Read-only; hits the public API over HTTP. Each scenario is warmed before it
 * is measured so the cache-warm target is what we actually test.
 *
 * Run (server must be up):
 *   npx tsx src/scripts/loadCheck.ts --base=http://localhost:4000 --requests=500 --concurrency=20
 *   npx tsx src/scripts/loadCheck.ts --token=<jwt>     # include recommendations
 */

type Args = {
  base: string;
  requests: number;
  concurrency: number;
  token: string | null;
};

function parseArgs(argv: string[]): Args {
  let base = process.env["BASE_URL"] ?? "http://localhost:4000";
  let requests = 500;
  let concurrency = 20;
  let token: string | null = null;
  for (const arg of argv) {
    const b = arg.match(/^--base=(.+)$/);
    if (b) base = b[1]!;
    const r = arg.match(/^--requests=(\d+)$/);
    if (r) requests = Number(r[1]);
    const c = arg.match(/^--concurrency=(\d+)$/);
    if (c) concurrency = Number(c[1]);
    const t = arg.match(/^--token=(.+)$/);
    if (t) token = t[1]!;
  }
  return { base, requests, concurrency, token };
}

type Scenario = {
  name: string;
  path: string;
  targetMs: number;
  auth?: boolean;
};

const SCENARIOS: Scenario[] = [
  { name: "random", path: "/api/random", targetMs: 200 },
  { name: "browse", path: "/api/films?sort=rating&page=1&limit=12", targetMs: 200 },
  { name: "browse+filter", path: "/api/films?awardBody=oscar&genre=Drama&sort=rating&limit=12", targetMs: 200 },
  { name: "recommendations (warm)", path: "/api/recommendations?limit=6", targetMs: 150, auth: true },
];

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[idx]!;
}

async function timeRequest(url: string, headers: Record<string, string>): Promise<{ ms: number; ok: boolean }> {
  const start = performance.now();
  try {
    const res = await fetch(url, { headers });
    // Drain the body so timing reflects a full response.
    await res.arrayBuffer();
    return { ms: performance.now() - start, ok: res.ok };
  } catch {
    return { ms: performance.now() - start, ok: false };
  }
}

async function runScenario(args: Args, scenario: Scenario) {
  const url = `${args.base}${scenario.path}`;
  const headers = scenario.auth && args.token ? { authorization: `Bearer ${args.token}` } : {};

  // Warm-up (also primes the cache for the warm target).
  for (let i = 0; i < Math.min(10, args.concurrency); i++) {
    await timeRequest(url, headers);
  }

  const latencies: number[] = [];
  let errors = 0;
  let next = 0;

  async function worker() {
    while (next < args.requests) {
      next += 1;
      const { ms, ok } = await timeRequest(url, headers);
      // Only successful responses count toward latency — a flood of fast 429s
      // (e.g. the rate limiter) must not make a scenario look fast.
      if (ok) latencies.push(ms);
      else errors += 1;
    }
  }

  const start = performance.now();
  await Promise.all(Array.from({ length: args.concurrency }, () => worker()));
  const wallMs = performance.now() - start;

  latencies.sort((a, b) => a - b);
  const p50 = percentile(latencies, 50);
  const p95 = percentile(latencies, 95);
  const p99 = percentile(latencies, 99);
  const rps = (latencies.length / wallMs) * 1000;
  const errorRate = errors / args.requests;
  // Pass requires both: under the p95 target AND a healthy success rate.
  const pass = latencies.length > 0 && p95 <= scenario.targetMs && errorRate < 0.01;

  return { scenario, p50, p95, p99, rps, errors, n: latencies.length, pass };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  console.log(`\nLoad check → ${args.base}`);
  console.log(`Requests: ${args.requests} per scenario · concurrency: ${args.concurrency}\n`);

  console.log("  scenario                  n     p50      p95      p99     rps    target   result");
  let anyFail = false;
  for (const scenario of SCENARIOS) {
    if (scenario.auth && !args.token) {
      console.log(`  ${scenario.name.padEnd(24)} — skipped (no --token)`);
      continue;
    }
    const r = await runScenario(args, scenario);
    if (!r.pass) anyFail = true;
    const fmt = (n: number) => `${n.toFixed(1)}ms`.padEnd(8);
    console.log(
      `  ${scenario.name.padEnd(24)} ${String(r.n).padEnd(5)} ${fmt(r.p50)} ${fmt(r.p95)} ${fmt(r.p99)} ` +
        `${r.rps.toFixed(0).padEnd(6)} <${scenario.targetMs}ms  ${r.pass ? "PASS" : "FAIL"}${r.errors ? ` (${r.errors} err)` : ""}`,
    );
  }
  console.log(`\nVerdict (by p95): ${anyFail ? "FAIL — some scenario over target" : "PASS — all under target"}\n`);
  process.exitCode = anyFail ? 1 : 0;
}

void main();
