import type { AwardBodyBreakdown } from "./types";

export type AwardBodySegment = { label: string; count: number; color: string; percent: number };
export type AwardBodyLink = AwardBodySegment & { href: string };
export type AwardBodyViewModel = { composition: AwardBodySegment[]; coverage: AwardBodyLink[] };

const COVERAGE_DEFINITIONS = [
  { key: "oscar", label: "Oscars", color: "#e8453c", href: "/browse?awardBody=oscar" },
  { key: "goldenGlobe", label: "Golden Globe", color: "#D4AF37", href: "/browse?awardBody=goldenglobe" },
  { key: "cannes", label: "Cannes", color: "#4a9eff", href: "/browse?awardBody=cannes" },
  { key: "berlin", label: "Berlinale", color: "#a78bfa", href: "/browse?awardBody=berlin" },
] as const;

export function buildAwardBodyViewModel(breakdown: AwardBodyBreakdown): AwardBodyViewModel {
  const percent = (count: number) => (count / (breakdown.total || 1)) * 100;
  const composition = buildComposition(breakdown).map((segment) => ({
    ...segment,
    percent: percent(segment.count),
  }));
  const coverage = COVERAGE_DEFINITIONS.map(({ key, ...definition }) => ({
    ...definition,
    count: breakdown.coverage[key],
    percent: percent(breakdown.coverage[key]),
  })).filter(({ count }) => count > 0);
  return { composition, coverage };
}

function buildComposition(breakdown: AwardBodyBreakdown) {
  return [
    { label: "Oscar only", count: breakdown.composition.oscarOnly, color: "#e8453c" },
    { label: "Golden Globe only", count: breakdown.composition.goldenGlobeOnly, color: "#D4AF37" },
    { label: "Cannes only", count: breakdown.composition.cannesOnly, color: "#4a9eff" },
    { label: "Berlinale only", count: breakdown.composition.berlinOnly, color: "#a78bfa" },
    { label: "Multiple bodies", count: breakdown.composition.multiple, color: "#8a8597" },
  ].filter(({ count }) => count > 0);
}
