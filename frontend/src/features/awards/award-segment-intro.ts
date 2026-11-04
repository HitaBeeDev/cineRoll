import type { AwardSegment } from "./resolve-award-segment";

/** Plain-language intro for a year, category or genre page, built from its data. */
export function awardSegmentIntro(segment: AwardSegment): string[] {
  if (segment.kind === "year") {
    const { year, name, films, categories } = segment.data;
    const winners = new Set(
      categories.flatMap((c) => c.entries.filter((e) => e.won).map((e) => e.film.slug)),
    ).size;
    return [
      `${films} films were recognised at the ${year} ${name}, across ${categories.length} categories. ${winners} of them took home at least one award.`,
      "In every category the winner is listed first, followed by the other nominees. Each title links to the film's full award history at all four awards.",
    ];
  }

  if (segment.kind === "category") {
    const { name, shortName, films, years } = segment.data;
    const winners = years.reduce((sum, y) => sum + y.entries.filter((e) => e.won).length, 0);
    return [
      `Every film recognised in the ${shortName} ${name} category in CineRoll's records: ${films} films across ${years.length} years, ${winners} of them winners.`,
      "Newest first. The winner of each year is listed at the top, followed by the other nominees.",
    ];
  }

  const { name, shortName, films } = segment.data;
  const winners = films.filter((f) => f.wins > 0).length;
  return [
    `${films.length} ${name.toLowerCase()} films have been recognised at the ${shortName}, and ${winners} of them won at least one award. They are ranked here by wins, then by nominations.`,
  ];
}
