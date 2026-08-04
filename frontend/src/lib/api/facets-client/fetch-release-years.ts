import { API_URL } from "@/lib/api/constants/api-url";
import { getCachedPromise } from "../promise-cache";

export function fetchReleaseYears(): Promise<number[]> {
  return getCachedPromise("releaseYears", async () => {
    const response = await fetch(`${API_URL}/api/films/release-years`, {
      cache: "force-cache",
    });
    if (!response.ok) throw new Error(`release-years ${response.status}`);
    return ((await response.json()) as { releaseYears: number[] }).releaseYears;
  }).catch(() => []);
}
