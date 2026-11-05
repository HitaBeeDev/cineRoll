import type { DataPageData } from "../data-page-types";

const NUMBER = new Intl.NumberFormat("en-US");

export function DataStatTiles({ summary, crossover }: Pick<DataPageData, "summary" | "crossover">) {
  const tiles = [
    summary && { label: "Films and series", value: summary.totalFilms },
    summary && { label: "Nominations", value: summary.totalNominations },
    summary && { label: "Wins", value: summary.totalWins },
    crossover && { label: "At more than one award", value: crossover.multiple },
  ].filter((tile): tile is { label: string; value: number } => Boolean(tile));

  if (tiles.length === 0) return null;

  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 sm:grid-cols-4">
      {tiles.map((tile) => (
        <div key={tile.label} className="bg-ink-950 px-5 py-5">
          <dt className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.2em] text-fg-muted">
            {tile.label}
          </dt>
          <dd className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold tabular-nums text-[#f8f8f4]">
            {NUMBER.format(tile.value)}
          </dd>
        </div>
      ))}
    </dl>
  );
}
