import Image from "next/image";
import Link from "next/link";
import type { AwardSegment } from "../resolve-award-segment";
import { AwardEntryList } from "./award-entry-list";
import { AwardSectionTitle } from "./award-section-title";
import { AwardYearNav } from "./award-year-nav";
import { posterAlt } from "@/lib/format/poster-alt";

/** The body of a year, category or genre page under one award. */
export function AwardSegmentView({ segment }: { segment: AwardSegment }) {
  const base = `/awards/${segment.data.body}`;

  if (segment.kind === "year") {
    const { data } = segment;
    return (
      <>
        {data.categories.map((category) => (
          <section key={category.slug} aria-labelledby={`cat-${category.slug}`}>
            <AwardSectionTitle id={`cat-${category.slug}`}>
              <Link href={`${base}/${category.slug}`} className="hover:text-fg-hi">
                {category.name}
              </Link>
            </AwardSectionTitle>
            <div className="mt-3">
              <AwardEntryList entries={category.entries} category={category.name} />
            </div>
          </section>
        ))}
        <AwardYearNav basePath={base} label={data.shortName} prev={data.prev} next={data.next} />
      </>
    );
  }

  if (segment.kind === "category") {
    const { data } = segment;
    return (
      <>
        {data.years.map(({ year, hasPage, entries }) => (
          <section key={year} aria-labelledby={`year-${year}`}>
            <AwardSectionTitle id={`year-${year}`}>
              {hasPage ? (
                <Link href={`${base}/${data.slug}/${year}`} className="hover:text-fg-hi">
                  {year}
                </Link>
              ) : (
                year
              )}
            </AwardSectionTitle>
            <div className="mt-3">
              <AwardEntryList entries={entries} category={data.name} />
            </div>
          </section>
        ))}
      </>
    );
  }

  return (
    <ul className="divide-y divide-white/5">
      {segment.data.films.map(({ film, wins, nominations }) => (
        <li key={film.slug} className="flex items-center gap-4 py-3">
          {film.posterUrl ? (
            <Image
              src={film.posterUrl}
              alt={posterAlt(film, wins > 0 ? `${wins} ${segment.data.shortName} ${wins === 1 ? "win" : "wins"}` : `${segment.data.shortName} nominee`)}
              width={40}
              height={60}
              className="h-[60px] w-[40px] shrink-0 rounded object-cover"
            />
          ) : (
            <div className="h-[60px] w-[40px] shrink-0 rounded bg-ink-750" aria-hidden />
          )}
          <div className="min-w-0 flex-1">
            <Link href={`/film/${film.slug}`} className="font-medium hover:text-accent hover:underline">
              {film.title}
            </Link>
            {film.year && <span className="ml-2 text-sm text-fg-muted">({film.year})</span>}
          </div>
          <span className="shrink-0 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.16em] text-fg-muted">
            {wins > 0 ? `${wins} won · ` : ""}
            {nominations} nom.
          </span>
        </li>
      ))}
    </ul>
  );
}
