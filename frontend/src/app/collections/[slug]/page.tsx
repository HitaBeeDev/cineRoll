import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FilmTile } from "@/components/film-tile";
import { FILM_GRID_CLASS } from "@/components/film-tile/film-grid-class";
import { JsonLd } from "@/components/json-ld";
import { AwardPageShell } from "@/features/awards/components/award-page-shell";
import { COLLECTIONS } from "@/features/collections/collections";
import { fetchCollectionFilms } from "@/features/collections/fetch-collection-films";
import { MIN_COLLECTION_FILMS } from "@/features/collections/fetch-collection-sizes";
import { SITE_URL } from "@/lib/site-url";

type Props = { params: Promise<{ slug: string }> };

// Rendered on first visit, then cached for a day — never at build time.
export const revalidate = 86400;
export function generateStaticParams() {
  return [];
}

function findCollection(slug: string) {
  return COLLECTIONS.find((collection) => collection.slug === slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const collection = findCollection((await params).slug);
  if (!collection) return {};
  return {
    title: collection.title,
    description: collection.description,
    alternates: { canonical: `/collections/${collection.slug}` },
  };
}

export default async function CollectionPage({ params }: Props) {
  const collection = findCollection((await params).slug);
  if (!collection) notFound();

  const { films, total } = await fetchCollectionFilms(collection.params, collection.sort);
  if (total < MIN_COLLECTION_FILMS) notFound();

  const path = `/collections/${collection.slug}`;

  return (
    <AwardPageShell
      crumbs={[
        { label: "Collections", href: "/collections" },
        { label: collection.h1, href: path },
      ]}
      title={collection.h1}
      intro={
        <>
          <p>{collection.intro}</p>
          <p>
            {total > films.length
              ? `${total} films — showing the ${films.length} with the most wins.`
              : `${total} films.`}
            {collection.related && (
              <>
                {" "}
                <Link href={collection.related.href} className="text-fg-hi underline underline-offset-4 hover:text-accent">
                  See {collection.related.label}
                </Link>
                .
              </>
            )}
          </p>
        </>
      }
    >
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: collection.h1,
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
      <div className={FILM_GRID_CLASS}>
        {films.map((film) => (
          <FilmTile key={film.id} film={film} />
        ))}
      </div>
    </AwardPageShell>
  );
}
