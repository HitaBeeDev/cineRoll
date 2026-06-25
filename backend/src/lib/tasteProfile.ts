import { cache, cacheKeys } from "./cache";
import { SENTIMENT_WEIGHT } from "./tasteWeights";
import { aggregateTasteVectors } from "./tasteProfile/aggregator";
import { TASTE_PROFILE_CONFIG } from "./tasteProfile/constants";
import { toTasteProfileVectors } from "./tasteProfile/profileMapper";
import {
  findTasteProfile,
  findTasteProfileFreshness,
  saveTasteProfile,
  upsertStaleProfile,
} from "./tasteProfile/profileRepository";
import { mapTasteSignals } from "./tasteProfile/signalMapper";
import { loadTasteSignalRows } from "./tasteProfile/signalRepository";
import { TasteProfileVectors } from "./tasteProfile/types";

export { aggregateTasteVectors } from "./tasteProfile/aggregator";
export { filmFeatureKeys, filmFeatureSelect } from "./tasteProfile/filmFeatures";
export { SENTIMENT_WEIGHT };
export type { FilmFeatures, Signal, TasteProfileVectors } from "./tasteProfile/types";

export async function markTasteProfileStale(userId: string): Promise<void> {
  const staleAt = new Date();

  await cache.deleteByPrefix(cacheKeys.recommendationsPrefix(userId));
  await upsertStaleProfile(userId, staleAt);
}

export async function buildTasteProfile(
  userId: string,
): Promise<TasteProfileVectors> {
  const rows = await loadTasteSignalRows(userId);
  const profile = aggregateTasteVectors(
    mapTasteSignals(rows),
    rows.onboardingGenres,
  );

  await saveTasteProfile(userId, profile);

  return profile;
}

export async function refreshTasteProfileIfStale(userId: string): Promise<void> {
  const freshness = await findTasteProfileFreshness(userId);

  if (needsProfileRebuild(freshness)) {
    await buildTasteProfile(userId);
  }
}

export async function getTasteProfile(
  userId: string,
): Promise<TasteProfileVectors> {
  await refreshTasteProfileIfStale(userId);

  return toTasteProfileVectors(await findTasteProfile(userId));
}

function needsProfileRebuild(
  freshness: { staleAt: Date | null; updatedAt: Date } | null,
): boolean {
  return (
    freshness === null ||
    freshness.staleAt !== null ||
    Date.now() - freshness.updatedAt.getTime() > TASTE_PROFILE_CONFIG.staleMaxAgeMs
  );
}
