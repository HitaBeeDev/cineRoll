type FilmOgPlotProps = {
  plot: string | null;
};

export function FilmOgPlot({ plot }: FilmOgPlotProps) {
  if (!plot) return null;

  return (
    <div style={{ display: "flex", marginTop: 28, maxWidth: 680, color: "#a4a4b8", fontSize: 24, lineHeight: 1.4 }}>
      {plot}
    </div>
  );
}
