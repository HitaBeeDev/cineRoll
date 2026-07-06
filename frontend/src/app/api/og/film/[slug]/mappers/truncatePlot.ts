const MAX_PLOT_LENGTH = 150;

export function truncatePlot(plot: string | null): string | null {
  if (!plot) return null;
  if (plot.length <= MAX_PLOT_LENGTH) return plot;
  return `${plot.slice(0, MAX_PLOT_LENGTH - 3)}...`;
}
