import Image from "next/image";
import Link from "next/link";
import type { RollFilm } from "@/lib/api/roll-types";
import { posterAlt } from "@/lib/format/poster-alt";

/** The film a tool roll landed on: poster, the basics, and the way in. */
export function ToolRollCard({ film }: { film: RollFilm }) {
  const year = film.year ?? film.releaseYear;

  return (
    <article className="flex gap-4 rounded-lg border border-edge bg-ink-800/70 p-4 sm:gap-6 sm:p-5">
      {film.posterUrl ? (
        <Image
          src={film.posterUrl}
          alt={posterAlt(film)}
          width={120}
          height={180}
          className="h-[150px] w-[100px] shrink-0 rounded-md object-cover sm:h-[180px] sm:w-[120px]"
        />
      ) : (
        <div className="h-[150px] w-[100px] shrink-0 rounded-md bg-ink-750 sm:h-[180px] sm:w-[120px]" />
      )}
      <div className="flex min-w-0 flex-col">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold leading-tight text-fg-hi sm:text-3xl">
          {film.title}
        </h2>
        <p className="mt-1 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.18em] text-fg-muted">
          {[year, film.director, film.runtime ? `${film.runtime} min` : null].filter(Boolean).join(" · ")}
        </p>
        {film.plot && (
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-fg-dim">{film.plot}</p>
        )}
        <Link
          href={`/film/${film.slug}`}
          className="mt-auto inline-flex w-fit items-center gap-1 pt-3 text-sm font-medium text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
        >
          See its awards and details →
        </Link>
      </div>
    </article>
  );
}
