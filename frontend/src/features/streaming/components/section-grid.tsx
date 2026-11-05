import Link from "next/link";
import { FilmGridSection } from "@/features/collections/components/film-grid-section";
import type { FilledSection } from "../fetch-section-films";

const LINK = "text-fg-hi underline decoration-white/25 underline-offset-4 transition-colors hover:text-accent";

/** One section: its posters, how many there are in all, and where the full list lives. */
export function SectionGrid({
  section,
  title,
  moreHref,
}: {
  section: FilledSection;
  title: string;
  /** A browse link with this exact filter set, when browse can express it. */
  moreHref?: string;
}) {
  const more = section.total > section.films.length;
  return (
    <FilmGridSection
      id={`section-${section.key}`}
      title={title}
      films={section.films}
      footer={
        <>
          {more ? `${section.total} in all.` : `${section.total} ${section.total === 1 ? "film" : "films"}.`}
          {more && moreHref && (
            <>
              {" "}
              <Link href={moreHref} className={LINK}>
                See every one
              </Link>
              .
            </>
          )}
          {section.related && (
            <>
              {" "}
              <Link href={section.related.href} className={LINK}>
                {section.related.label}, on any service
              </Link>
              .
            </>
          )}
        </>
      }
    />
  );
}
