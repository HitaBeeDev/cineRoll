import { fitDescription } from "@/lib/seo/fit-description";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { FilmGridSection } from "@/features/collections/components/film-grid-section";
import { describeFilmList } from "@/features/collections/describe-film-list";
import { AwardPageShell } from "@/features/awards/components/award-page-shell";
import { fetchCollectionFilms } from "@/features/collections/fetch-collection-films";
import { MIN_COLLECTION_FILMS } from "@/features/collections/fetch-collection-sizes";
import { MOODS } from "@/features/moods/moods";
import { SITE_URL } from "@/lib/site-url";

type Props = { params: Promise<{ mood: string }> };

// Rendered on first visit, then cached for a day — never at build time.
export const revalidate = 86400;
export function generateStaticParams() {
  return [];
}

function findMood(slug: string) {
  return MOODS.find((mood) => mood.tag === slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const mood = findMood((await params).mood);
  if (!mood) return {};
  return {
    title: `${mood.name} Award-Winning Films`,
    description: fitDescription(`${mood.blurb} Oscar, Golden Globe, Cannes and Berlinale films, ranked by wins.`),
    alternates: { canonical: `/moods/${mood.tag}` },
  };
}

export default async function MoodPage({ params }: Props) {
  const mood = findMood((await params).mood);
  if (!mood) notFound();

  const { films, total } = await fetchCollectionFilms({ moodTag: mood.tag }, "wins");
  if (total < MIN_COLLECTION_FILMS) notFound();
  const path = `/moods/${mood.tag}`;

  return (
    <AwardPageShell
      crumbs={[
        { label: "Moods", href: "/moods" },
        { label: mood.name, href: path },
      ]}
      title={`${mood.name} Award-Winning Films`}
      intro={
        <>
          <p>{mood.blurb}</p>
          <p>{describeFilmList(films, total).join(" ")}</p>
          <p>
            {total.toLocaleString("en-US")} films recognised at the Oscars, the Golden Globes,
            Cannes or the Berlinale carry this mood.{" "}
            {total > films.length ? `Here are the ${films.length} with the most wins.` : "Ranked by wins."}{" "}
            Moods are tagged automatically for each film, so treat them as a guide.{" "}
            <Link href="/moods" className="text-fg-hi underline underline-offset-4 hover:text-accent">
              Other moods
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
          name: `${mood.name} award-winning films`,
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
      <FilmGridSection title={`${mood.name} films, most awarded first`} films={films} />
    </AwardPageShell>
  );
}
