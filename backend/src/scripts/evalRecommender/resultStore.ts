import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { RESULTS_PATH } from "./config";
import type { EvalRecord } from "./types";

export function loadRecords(): EvalRecord[] {
  try {
    const parsed = JSON.parse(readFileSync(RESULTS_PATH, "utf8"));
    return Array.isArray(parsed) ? (parsed as EvalRecord[]) : [];
  } catch {
    return [];
  }
}

/** Upsert this run's record by modelVersion, with the latest run per version. */
export function saveRecord(record: EvalRecord): EvalRecord[] {
  const records = loadRecords().filter(existing => existing.modelVersion !== record.modelVersion);
  records.push(record);
  records.sort((a, b) => a.modelVersion.localeCompare(b.modelVersion));

  mkdirSync(dirname(RESULTS_PATH), { recursive: true });
  writeFileSync(RESULTS_PATH, JSON.stringify(records, null, 2) + "\n");

  return records;
}
