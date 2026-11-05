import Image from "next/image";
import Link from "next/link";
import type { YearCell } from "../hub/hub-types";

const FULL_CEREMONY_CLASS =
  "inline-flex items-center gap-1 text-xs text-fg-muted underline decoration-white/20 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent/60";

/**
 * One award's result for the selected year: the top-prize winner(s) with poster
 * and links, or an honest note when there is no ceremony or no winner on record.
 */
export function YearCellCard({ cell, year }: { cell: YearCell; year: number }) {
  return (
    <li
      className={
        cell.status === "none"
          ? "rounded-xl border border-dashed border-white/10 p-4"
          : "rounded-xl border border-white/10 bg-white/[0.02] p-4"
      }
    >
      <p className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.16em] text-accent">
        {cell.shortName}
        <span className="text-fg-faint"> · {cell.prize}</span>
      </p>

      {cell.status === "winners" && (
        <ul className="mt-3 space-y-3">
          {cell.films.map((film) => (
            <li key={film.slug} className="flex gap-3">
              <Link
                href={`/film/${film.slug}`}
                tabIndex={-1}
                aria-hidden
                className="w-14 shrink-0 overflow-hidden rounded ring-1 ring-white/10"
              >
                {film.posterUrl ? (
                  <Image
                    src={film.posterUrl}
                    alt=""
                    width={185}
                    height={278}
                    className="aspect-[2/3] h-auto w-full object-cover"
                  />
                ) : (
                  <span className="block aspect-[2/3] w-full bg-white/5" />
                )}
              </Link>
              <div className="min-w-0">
                <Link
                  href={`/film/${film.slug}`}
                  className="font-medium leading-snug text-fg-hi transition-colors hover:text-accent-soft"
                >
                  {film.title}
                </Link>
                <p className="mt-1 text-xs text-fg-faint">Winner</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {cell.status === "no-winner" && (
        <p className="mt-3 text-sm leading-6 text-fg-muted">
          A ceremony is on record, but no {cell.prize} winner is.
        </p>
      )}
      {cell.status === "none" && (
        <p className="mt-3 text-sm leading-6 text-fg-faint">
          No {cell.shortName} ceremony on record for {year}.
        </p>
      )}

      {cell.ceremonyHref && (
        <Link href={cell.ceremonyHref} className={`mt-4 ${FULL_CEREMONY_CLASS}`}>
          Full {year} ceremony →
        </Link>
      )}
    </li>
  );
}
