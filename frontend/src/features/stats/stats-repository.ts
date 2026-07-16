import { STATS_API_URL } from "./config";
import type { StatsResponse } from "./types";

export async function fetchStats(): Promise<StatsResponse | null> {
  try {
    const response = await fetch(`${STATS_API_URL}/api/stats`, { cache: "no-store" });
    if (!response.ok) return null;
    return response.json() as Promise<StatsResponse>;
  } catch {
    return null;
  }
}
