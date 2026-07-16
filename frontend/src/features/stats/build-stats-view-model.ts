import { buildInsights } from "./build-insights";
import { buildReelItems } from "./build-reel-items";
import type { DecadeDatum, StatsResponse, StatsViewModel } from "./types";

export function buildStatsViewModel(stats: StatsResponse): StatsViewModel {
  const winRate = calculateWinRate(stats);
  const decadesSorted = stats.decadeBreakdown.map(({ decade }) => decade).sort((a, b) => a - b);
  const peakDecade = findPeakDecade(stats);

  return {
    winRate,
    avgNominationsPerFilm: calculateAverageNominations(stats),
    decadesSorted,
    decadeSpan: formatDecadeSpan(decadesSorted),
    reelItems: buildReelItems(stats),
    peakDecade,
    decadeData: buildDecadeData(stats),
    insights: buildInsights(stats),
    winRateContext: formatWinRateContext(winRate),
    densityContext: formatDensityContext(stats),
    conclusionPoints: buildConclusionPoints(peakDecade, winRate),
  };
}

function calculateWinRate(stats: StatsResponse): number {
  const { totalNominations, totalWins } = stats.summary;
  return totalNominations > 0 ? (totalWins / totalNominations) * 100 : 0;
}

function calculateAverageNominations(stats: StatsResponse): number {
  const { totalFilms, totalNominations } = stats.summary;
  return totalFilms > 0 ? totalNominations / totalFilms : 0;
}

function findPeakDecade(stats: StatsResponse): number {
  if (stats.decadeBreakdown.length === 0) return 0;
  return stats.decadeBreakdown.reduce((a, b) => (b.filmCount > a.filmCount ? b : a)).decade;
}

function buildDecadeData(stats: StatsResponse): DecadeDatum[] {
  return stats.decadeBreakdown.map((decade) => ({
    ...decade,
    href: `/browse?decadeMin=${decade.decade}&decadeMax=${decade.decade + 9}`,
  }));
}

function formatDecadeSpan(decades: number[]): string {
  return decades.length > 0 ? `${decades[0]}s – ${decades[decades.length - 1]}s` : "—";
}

function formatWinRateContext(winRate: number): string {
  return winRate > 0 ? `About 1 in ${(100 / winRate).toFixed(1)} nominations` : "No nominations recorded";
}

function formatDensityContext(stats: StatsResponse): string {
  const populated = stats.decadeBreakdown.filter(({ avgNominations }) => avgNominations > 0);
  if (populated.length === 0) return "Average nominations per film";
  const densest = populated.reduce((a, b) => (b.avgNominations > a.avgNominations ? b : a));
  return `Peaks at ${densest.avgNominations.toFixed(1)} in the ${densest.decade}s`;
}

function buildConclusionPoints(peakDecade: number, winRate: number): string[] {
  if (peakDecade === 0) return [];
  return [
    `The ${peakDecade}s dominate the dataset.`,
    "The Oscars shape the leaderboard.",
    `And only ${winRate.toFixed(0)}% of nominations ever become wins.`,
  ];
}
