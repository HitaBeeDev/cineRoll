export type LoadCheckArgs = {
  base: string;
  requests: number;
  concurrency: number;
  token: string | null;
};

export type Scenario = {
  name: string;
  path: string;
  targetMs: number;
  auth?: boolean;
};

export type TimedResponse = {
  ms: number;
  ok: boolean;
};

export type ScenarioResult = {
  scenario: Scenario;
  p50: number;
  p95: number;
  p99: number;
  rps: number;
  errors: number;
  n: number;
  pass: boolean;
};
