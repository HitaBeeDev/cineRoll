import type { StatsResponse } from "./types";

const STATS_API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function fetchStats(): Promise<StatsResponse | null> {
  try {
    const response = await fetch(`${STATS_API_URL}/api/stats`, { cache: "no-store" });
    if (!response.ok) return null;
    return response.json() as Promise<StatsResponse>;
  } catch {
    return null;
  }
}
