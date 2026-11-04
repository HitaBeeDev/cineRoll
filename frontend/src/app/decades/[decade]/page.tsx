import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { FilmGridSection } from "@/features/collections/components/film-grid-section";
import { describeFilmList } from "@/features/collections/describe-film-list";
import { AwardPageShell } from "@/features/awards/components/award-page-shell";
import { fetchCollectionFilms } from "@/features/collections/fetch-collection-films";
import { MIN_COLLECTION_FILMS } from "@/features/collections/fetch-collection-sizes";
import { DECADES } from "@/features/decades/decades";
import { parseDecade } from "@/features/decades/parse-decade";
import { SITE_URL } from "@/lib/site-url";

type Props = { params: Promise<{ decade: string }> };

// Rendered on first visit, then cached for a day — never at build time.
export const revalidate = 86400;
export function generateStaticParams() {
  return [];
}

const NAV_LINK =
  "rounded-md border border-edge px-4 py-2 text-sm text-fg-dim transition-colors hover:border-edge-hover hover:text-fg-hi";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const start = parseDecade((await params).decade);
  if (start === null) return {};
  return {
    title: `Best Award-Winning Films of the ${start}s`,
    description: `The most awarded films released in the ${start}s at the Oscars, Golden Globes, Cannes and the Berlinale — ranked by wins.`,
    alternates: { canonical: `/decades/${start}s` },
  };
}

export default async function DecadePage({ params }: Props) {
  const start = parseDecade((await params).decade);
  if (start === null) notFound();

  const { films, total } = await fetchCollectionFilms(
    { yearMin: String(start), yearMax: String(start + 9) },
    "wins",
  );
  if (total < MIN_COLLECTION_FILMS) notFound();

  const label = `${start}s`;
  const at = DECADES.indexOf(start);
  const prev = DECADES[at - 1];
  const next = DECADES[at + 1];

  return (
    <AwardPageShell
      crumbs={[
        { label: "Decades", href: "/decades" },
        { label, href: `/decades/${label}` },
      ]}
      title={`The Best Award-Winning Films of the ${label}`}
      intro={
        <>
          <p>
            {total.toLocaleString("en-US")} films released between {start} and {start + 9} were
            recognised at the Oscars, the Golden Globes, Cannes or the Berlinale.{" "}
            {total > films.length
              ? `Here are the ${films.length} that won the most, ranked by total wins.`
              : "Here they are, ranked by total wins."}
          </p>
          <p>{describeFilmList(films, total).join(" ")}</p>
          <p>
            Can&apos;t choose?{" "}
            <Link href="/tools/random-movie-by-decade" className="text-fg-hi underline underline-offset-4 hover:text-accent">
              Roll a random film from any decade
            </Link>
            .
          </p>
        </>
      }
    >
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: `The best award-winning films of the ${label}`,
          url: `${SITE_URL}/decades/${label}`,
          numberOfItems: films.length,
          itemListElement: films.map((film, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: `${SITE_URL}/film/${film.slug}`,
            name: film.title,
          })),
        }}
      />
      <FilmGridSection title={`Most awarded films of the ${label}`} films={films} />
      <nav aria-label="Other decades" className="flex flex-wrap justify-between gap-3">
        {prev ? (
          <Link href={`/decades/${prev}s`} className={NAV_LINK}>
            ← The {prev}s
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={`/decades/${next}s`} className={NAV_LINK}>
            The {next}s →
          </Link>
        )}
      </nav>
    </AwardPageShell>
  );
}
