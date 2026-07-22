import { fetchSeededRandom, type RollFilm } from "@/lib/api";
import { PICK_SEED_VARIANTS } from "./config";
import type { DailyPick, PickDiversity, PickSlot } from "./domain-types";
import { SLOT_FALLBACK_FILTERS } from "./pick-slots";

export async function selectPick(
  slot: PickSlot,
  day: string,
  usedIds: string[],
  diversity: PickDiversity,
  userId: string | undefined,
): Promise<DailyPick | null> {
  const seededPick = await findSeededPick(
    slot,
    day,
    usedIds,
    diversity,
    userId,
  );
  return seededPick ?? findRelaxedPick(slot, day, usedIds, userId);
}

async function findSeededPick(
  slot: PickSlot,
  day: string,
  usedIds: string[],
  diversity: PickDiversity,
  userId: string | undefined,
): Promise<DailyPick | null> {
  let fallback: DailyPick | null = null;
  const seenIds: string[] = [];

  for (let variant = 0; variant < PICK_SEED_VARIANTS; variant++) {
    const film = await fetchSeedVariant(slot, day, variant, [...usedIds, ...seenIds], userId);
    if (!film) continue;
    const pick = { film, slot };
    fallback ??= pick;
    seenIds.push(film.id);
    if (isDiverse(film, diversity)) return pick;
  }
  return fallback;
}

async function fetchSeedVariant(
  slot: PickSlot,
  day: string,
  variant: number,
  excludeIds: string[],
  userId: string | undefined,
): Promise<RollFilm | null> {
  const seed = variant === 0
    ? `${day}:${slot.num}`
    : `${day}:${slot.num}:v${variant}`;
  try {
    return (await fetchSeededRandom(seed, slot.filters, excludeIds, userId)).film;
  } catch {
    return null;
  }
}

async function findRelaxedPick(
  slot: PickSlot,
  day: string,
  usedIds: string[],
  userId: string | undefined,
): Promise<DailyPick | null> {
  const filters = SLOT_FALLBACK_FILTERS[slot.num];
  for (let index = 0; index < filters.length; index++) {
    try {
      const seed = `${day}:${slot.num}:fallback${index}`;
      const result = await fetchSeededRandom(seed, filters[index], usedIds, userId);
      return { film: result.film, slot };
    } catch {
      continue;
    }
  }
  return null;
}

function isDiverse(film: RollFilm, diversity: PickDiversity): boolean {
  const primaryGenre = film.genres[0];
  const hasDecadeClash = diversity.usedDecades.has(Math.floor(film.year / 10) * 10);
  const hasGenreClash = primaryGenre
    ? diversity.usedGenres.has(primaryGenre)
    : false;
  return !hasDecadeClash && !hasGenreClash;
}
