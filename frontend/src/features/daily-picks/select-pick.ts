import type { RollFilm } from "@/lib/api";
import { PICK_SEED_VARIANTS } from "@/features/daily-picks/config/pick-seed-variants";
import type { DailyPick, PickDiversity, PickSlot, SeededRoll } from "./domain-types";
import { SLOT_FALLBACK_FILTERS } from "@/features/daily-picks/pick-slots/slot-fallback-filters";

export async function selectPick(
  slot: PickSlot,
  day: string,
  usedIds: string[],
  diversity: PickDiversity,
  roll: SeededRoll,
): Promise<DailyPick | null> {
  const seededPick = await findSeededPick(slot, day, usedIds, diversity, roll);
  return seededPick ?? findRelaxedPick(slot, day, usedIds, roll);
}

async function findSeededPick(
  slot: PickSlot,
  day: string,
  usedIds: string[],
  diversity: PickDiversity,
  roll: SeededRoll,
): Promise<DailyPick | null> {
  let fallback: DailyPick | null = null;
  const seenIds: string[] = [];

  for (let variant = 0; variant < PICK_SEED_VARIANTS; variant++) {
    const film = await rollSeedVariant(slot, day, variant, [...usedIds, ...seenIds], roll);
    if (!film) continue;
    const pick = { film, slot };
    fallback ??= pick;
    seenIds.push(film.id);
    if (isDiverse(film, diversity)) return pick;
  }
  return fallback;
}

function rollSeedVariant(
  slot: PickSlot,
  day: string,
  variant: number,
  excludeIds: string[],
  roll: SeededRoll,
): Promise<RollFilm | null> {
  const seed = variant === 0
    ? `${day}:${slot.num}`
    : `${day}:${slot.num}:v${variant}`;
  return roll(seed, slot.filters, excludeIds);
}

async function findRelaxedPick(
  slot: PickSlot,
  day: string,
  usedIds: string[],
  roll: SeededRoll,
): Promise<DailyPick | null> {
  const filters = SLOT_FALLBACK_FILTERS[slot.num];
  for (let index = 0; index < filters.length; index++) {
    const film = await roll(`${day}:${slot.num}:fallback${index}`, filters[index] ?? {}, usedIds);
    if (film) return { film, slot };
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
