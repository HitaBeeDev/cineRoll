import { TASTE_SEED_STORAGE_KEY } from "@/lib/home-storage";

export function readTasteSeedGenres(): string[] {
  try {
    const raw = window.localStorage.getItem(TASTE_SEED_STORAGE_KEY);
    if (!raw) return [];
    const seed = JSON.parse(raw) as { genres?: unknown };
    return Array.isArray(seed.genres)
      ? seed.genres.filter((genre): genre is string => typeof genre === "string")
      : [];
  } catch {
    return [];
  }
}
