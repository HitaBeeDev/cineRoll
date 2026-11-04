import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { FilmGridSection } from "@/features/collections/components/film-grid-section";
import { describeFilmList } from "@/features/collections/describe-film-list";
import { AwardPageShell } from "@/features/awards/components/award-page-shell";
import { COLLECTIONS } from "@/features/collections/collections";
import { fetchCollectionFilms } from "@/features/collections/fetch-collection-films";
import { MIN_COLLECTION_FILMS } from "@/features/collections/fetch-collection-sizes";
import { buildItemList } from "@/lib/seo/build-item-list";

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
      related={COLLECTIONS.filter((other) => other.group === collection.group && other.slug !== collection.slug).map(
        (other) => ({ href: `/collections/${other.slug}`, label: other.h1 }),
      )}
      intro={
        <>
          <p>{collection.intro}</p>
          <p>{describeFilmList(films, total).join(" ")}</p>
          <p>
            {total > films.length
              ? `${total} films — showing the ${films.length} with the most ${collection.sort === "noms" ? "nominations" : "wins"}.`
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
      <JsonLd data={buildItemList(collection.h1, path, films)} />
      <FilmGridSection
        title={collection.sort === "newest" ? "Newest first" : collection.sort === "noms" ? "Most nominated first" : "Most awarded first"}
        films={films}
      />
    </AwardPageShell>
  );
}
