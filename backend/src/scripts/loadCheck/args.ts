import type { LoadCheckArgs } from "./types";

const DEFAULT_BASE_URL = "http://localhost:4000";
const DEFAULT_REQUESTS = 500;
const DEFAULT_CONCURRENCY = 20;

export function parseArgs(argv: string[]): LoadCheckArgs {
  let base = process.env["BASE_URL"] ?? DEFAULT_BASE_URL;
  let requests = DEFAULT_REQUESTS;
  let concurrency = DEFAULT_CONCURRENCY;
  let token: string | null = null;

  for (const arg of argv) {
    base = parseStringFlag(arg, "base") ?? base;
    requests = parseNumberFlag(arg, "requests") ?? requests;
    concurrency = parseNumberFlag(arg, "concurrency") ?? concurrency;
    token = parseStringFlag(arg, "token") ?? token;
  }

  return { base, requests, concurrency, token };
}

function parseStringFlag(arg: string, flag: string): string | null {
  const match = arg.match(new RegExp(`^--${flag}=(.+)$`));
  return match ? match[1]! : null;
}

function parseNumberFlag(arg: string, flag: string): number | null {
  const match = arg.match(new RegExp(`^--${flag}=(\\d+)$`));
  return match ? Number(match[1]) : null;
}
