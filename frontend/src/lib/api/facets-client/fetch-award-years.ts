import { API_URL } from "@/lib/api/constants/api-url";
import { getCachedPromise } from "../promise-cache";

export function fetchAwardYears(): Promise<number[]> {
  return getCachedPromise("awardYears", async () => {
    const response = await fetch(`${API_URL}/api/films/award-years`, {
      cache: "force-cache",
    });
    if (!response.ok) throw new Error(`award-years ${response.status}`);
    return ((await response.json()) as { awardYears: number[] }).awardYears;
  }).catch(() => []);
}
