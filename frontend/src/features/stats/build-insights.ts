import { formatNumber } from "./format-number";
import type { Insight, StatsResponse } from "./types";

export function buildInsights(stats: StatsResponse): Insight[] {
  const insights = [
    buildPeakDecadeInsight(stats),
    buildCrossBodyInsight(stats),
    buildWinRateInsight(stats),
    buildTopWinnerInsight(stats),
  ];

  return insights.filter((insight): insight is Insight => insight !== null).slice(0, 4);
}

function buildPeakDecadeInsight(stats: StatsResponse): Insight | null {
  if (stats.decadeBreakdown.length === 0) return null;
  const peak = stats.decadeBreakdown.reduce((a, b) => (b.filmCount > a.filmCount ? b : a));
  return {
    title: `The ${peak.decade}s are the densest era`,
    body: `${formatNumber(peak.filmCount)} films land in the ${peak.decade}s — more than any other decade in the archive.`,
  };
}

function buildCrossBodyInsight(stats: StatsResponse): Insight | null {
  const breakdown = stats.awardBodyBreakdown;
  if (!breakdown || breakdown.total === 0) return null;
  const count = breakdown.composition.multiple;
  return {
    title: `${Math.round((count / breakdown.total) * 100)}% of films cross award bodies`,
    body: `${formatNumber(count)} films were honored by more than one of the Oscars, Golden Globes, Cannes, or Berlinale.`,
  };
}

function buildWinRateInsight(stats: StatsResponse): Insight | null {
  const { totalNominations, totalWins } = stats.summary;
  if (totalNominations === 0) return null;
  const rate = ((totalWins / totalNominations) * 100).toFixed(1);
  return {
    title: `Only ${rate}% of nominations become wins`,
    body: `Across ${formatNumber(totalNominations)} nominations, the archive records just ${formatNumber(totalWins)} wins.`,
  };
}

function buildTopWinnerInsight(stats: StatsResponse): Insight | null {
  const film = stats.topWinningFilms[0];
  if (!film) return null;
  return {
    title: `${film.title} tops every win count`,
    body: `${film.title} (${film.releaseYear}) holds the archive record with ${film.count} wins.`,
  };
}
