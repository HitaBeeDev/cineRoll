import type { Film } from "@cineroll/types";
import type { AwardCategoryPayload, AwardFilm } from "@/features/awards/award-types";
import { fetchAward } from "@/features/awards/fetch-award";
import type { Collection } from "./collection-types";
import { COLLECTIONS } from "./collections";
import { fetchCollectionFilms } from "./fetch-collection-films";

function listJoin(items: string[]): string {
  return items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
}

const label = (film: { title: string; year: number | null }) => (film.year ? `${film.title} (${film.year})` : film.title);

/** The answer and the list's rules, from the data: what a searcher asked, said first. */
export type CollectionAnswer = { answer: string | null; rules: string };

/**
 * Winners' lists: how many films, which ceremonies, the latest and first
 * winner — read from the award category, which knows ceremony years (the films
 * API only has release years). Cross-award lists: the overlap of two top
 * prizes. Every number comes from the data; nothing is written by hand.
 */
export async function collectionAnswer(collection: Collection, films: Film[], total: number): Promise<CollectionAnswer> {
  const order =
    collection.sort === "newest"
      ? "newest release first"
      : collection.sort === "noms"
        ? "by nominations across the four awards, most first"
        : "by wins across the four awards, most first";

  if (collection.topPrize) {
    const category = await fetchAward<AwardCategoryPayload>(collection.topPrize.category.replace("/", "/categories/"));
    const ceremonies = (category?.years ?? [])
      .map((year) => ({ year: year.year, winners: uniqueFilms(year.entries.filter((e) => e.won).map((e) => e.film)) }))
      .filter((year) => year.winners.length > 0);
    const latest = ceremonies[0];
    const first = ceremonies.at(-1);
    if (latest && first && latest !== first) {
      const name = collection.topPrize.name;
      return {
        answer: `${total} films have won ${name}, at ${ceremonies.length} ceremonies from ${first.year} to ${latest.year}. The latest winner is ${listJoin(latest.winners.map(label))}, at the ${latest.year} ceremony; the first was ${listJoin(first.winners.map(label))}, in ${first.year}.`,
        rules: `Sorted ${order}. The year beside each title is its release year, ${releaseGap(ceremonies)}.`,
      };
    }
  }

  const rules = `Sorted ${order}. The year beside each title is its release year, not the year of the ceremony.`;
  if (collection.overlap) {
    const [aSlug, bSlug] = collection.overlap.collections;
    const [a, b] = await Promise.all([winnersOf(aSlug), winnersOf(bSlug)]);
    const bSlugs = new Set(b.map((film) => film.slug));
    const both = a.filter((film) => bSlugs.has(film.slug)).sort((x, y) => x.year - y.year);
    if (both.length > 0) {
      return {
        answer: `${both.length === 1 ? "One film has" : `${both.length} films have`} won ${collection.overlap.label}: ${listJoin(both.map(label))}.`,
        rules,
      };
    }
  }
  return { answer: null, rules };
}

async function winnersOf(slug: string): Promise<Film[]> {
  const collection = COLLECTIONS.find((entry) => entry.slug === slug);
  if (!collection) return [];
  return (await fetchCollectionFilms(collection.params, collection.sort)).films;
}

function uniqueFilms(films: AwardFilm[]): AwardFilm[] {
  return films.filter((film, index) => films.findIndex((other) => other.slug === film.slug) === index);
}

/** Oscars honour the previous year's films; festivals show films in the year they premiere. Said from the data. */
function releaseGap(ceremonies: { year: number; winners: AwardFilm[] }[]): string {
  const gaps = ceremonies.flatMap((c) => c.winners.map((film) => (film.year ? c.year - film.year : null)));
  const yearBefore = gaps.filter((gap) => gap === 1).length;
  const sameYear = gaps.filter((gap) => gap === 0).length;
  return yearBefore > sameYear
    ? "usually the year before the ceremony"
    : "usually the same year as the ceremony";
}
