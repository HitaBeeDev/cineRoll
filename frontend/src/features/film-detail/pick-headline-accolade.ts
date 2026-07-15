import type { HeadlineAccolade } from "@/components/hero-headline-accolade";
import type { CeremonySummary } from "./domain-types";

const CATEGORY_PRESTIGE: ReadonlyArray<readonly [RegExp, number]> = [
  [/palme d['’]?or/i, 100],
  [/best (motion )?picture|best (motion picture|film)|best motion picture/i, 95],
  [/grand prix/i, 85],
  [/best director/i, 80],
  [/best (lead )?(actor|actress)/i, 70],
  [/best (original |adapted )?screenplay|best writing/i, 60],
  [/best supporting (actor|actress)/i, 55],
];

type RankedAccolade = HeadlineAccolade & { rank: number };

export function pickHeadlineAccolade(
  ceremonies: CeremonySummary[],
): HeadlineAccolade | null {
  const accolades = ceremonies.flatMap(toRankedAccolades);
  const best = accolades.sort(compareAccolades)[0];
  if (!best) return null;

  return {
    category: best.category,
    ceremony: best.ceremony,
    year: best.year,
    won: best.won,
  };
}

function toRankedAccolades(ceremony: CeremonySummary): RankedAccolade[] {
  return ceremony.records.map((record) => ({
    category: record.category,
    ceremony: ceremony.title,
    year: record.awardYear,
    won: record.won,
    rank: (record.won ? 1000 : 0) + getCategoryScore(record.category),
  }));
}

function compareAccolades(a: RankedAccolade, b: RankedAccolade): number {
  return b.rank - a.rank || a.year - b.year;
}

function getCategoryScore(category: string): number {
  return CATEGORY_PRESTIGE.find(([pattern]) => pattern.test(category))?.[1] ?? 30;
}
