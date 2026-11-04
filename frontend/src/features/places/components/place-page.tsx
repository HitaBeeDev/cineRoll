import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { FilmGridSection } from "@/features/collections/components/film-grid-section";
import { describeFilmList } from "@/features/collections/describe-film-list";
import { AwardPageShell } from "@/features/awards/components/award-page-shell";
import { fetchCollectionFilms } from "@/features/collections/fetch-collection-films";
import { SITE_URL } from "@/lib/site-url";
import { PLACE_COPY } from "../place-copy";
import type { Place, PlaceKind } from "../place-types";

/** One country or language: its most awarded films, top 100 by wins. */
export async function PlacePage({ kind, place }: { kind: PlaceKind; place: Place }) {
  const copy = PLACE_COPY[kind];
  const { films, total } = await fetchCollectionFilms({ [copy.param]: place.value }, "wins");
  const path = `/${kind}/${place.slug}`;

  return (
    <AwardPageShell
      crumbs={[
        { label: copy.crumb, href: `/${kind}` },
        { label: place.name, href: path },
      ]}
      title={copy.h1(place.name)}
      intro={
        <>
          <p>{copy.lead(place.name, total.toLocaleString("en-US"))}</p>
          <p>{describeFilmList(films, total).join(" ")}</p>
          <p>
            {total > films.length
              ? `Here are the ${films.length} with the most wins. `
              : "Ranked by total wins. "}
            <Link href={`/${kind}`} className="text-fg-hi underline underline-offset-4 hover:text-accent">
              See all {copy.crumb.toLowerCase()}
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
          name: copy.h1(place.name),
          url: `${SITE_URL}${path}`,
          numberOfItems: films.length,
          itemListElement: films.map((film, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: `${SITE_URL}/film/${film.slug}`,
            name: film.title,
          })),
        }}
      />
      <FilmGridSection title="Most awarded first" films={films} />
    </AwardPageShell>
  );
}
