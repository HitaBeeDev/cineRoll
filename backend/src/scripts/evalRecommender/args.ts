import { DEFAULT_K_VALUES } from "./config";
import type { Args } from "./types";

export function parseArgs(argv: string[]): Args {
  let maxUsers: number | null = null;
  let kValues = DEFAULT_K_VALUES;
  let mmrLambdas: number[] | null = null;

  for (const arg of argv) {
    maxUsers = parseMaxUsers(arg) ?? maxUsers;
    kValues = parseKValues(arg) ?? kValues;
    mmrLambdas = parseMmrLambdas(arg) ?? mmrLambdas;
  }

  return { maxUsers, kValues, mmrLambdas };
}

function parseMaxUsers(arg: string): number | null {
  const match = arg.match(/^--max-users=(\d+)$/);
  return match ? Number(match[1]) : null;
}

function parseKValues(arg: string): number[] | null {
  const match = arg.match(/^--k=([\d,]+)$/);
  return match ? numbers(match[1]!).filter(number => number > 0) : null;
}

function parseMmrLambdas(arg: string): number[] | null {
  const match = arg.match(/^--mmr-lambda=([\d.,]+)$/);
  return match ? numbers(match[1]!).filter(value => value >= 0 && value <= 1) : null;
}

function numbers(value: string): number[] {
  return value.split(",").map(Number);
}
