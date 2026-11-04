import type { AwardEntry } from "./award-types";
import type { AwardSegment } from "./resolve-award-segment";

function listJoin(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
}

/** Films by number of wins in a set of entries, most first. */
function topWinners(entries: AwardEntry[]): { title: string; wins: number }[] {
  const wins = new Map<string, number>();
  for (const entry of entries) {
    if (entry.won) wins.set(entry.film.title, (wins.get(entry.film.title) ?? 0) + 1);
  }
  return [...wins].map(([title, count]) => ({ title, wins: count })).sort((a, b) => b.wins - a.wins);
}

/** Plain-language intro for a year, category or genre page, built from its data. */
export function awardSegmentIntro(segment: AwardSegment): string[] {
  if (segment.kind === "year") {
    const { year, name, films, categories } = segment.data;
    const entries = categories.flatMap((category) => category.entries);
    const winners = topWinners(entries);
    const paragraphs = [
      `${films} films were recognised at the ${year} ${name}, across ${categories.length} categories. ${winners.length} of them took home at least one award.`,
    ];
    const [first, second] = winners;
    if (first) {
      paragraphs.push(
        `The biggest winner of the year was ${first.title}, with ${first.wins} ${first.wins === 1 ? "award" : "awards"}${
          second && second.wins > 1 ? `, ahead of ${second.title} with ${second.wins}` : ""
        }. The categories below run from ${listJoin(categories.slice(0, 3).map((c) => c.name))} to the smaller prizes, and in every one the winner is listed first, followed by the other nominees.`,
      );
    }
    paragraphs.push("Each title links to the film's full award history at all four awards, and the links at the bottom step to the previous and next ceremony.");
    return paragraphs;
  }

  if (segment.kind === "category") {
    const { name, shortName, films, years } = segment.data;
    const winnerEntries = years.flatMap((y) => y.entries.filter((e) => e.won).map((e) => ({ ...e, year: y.year })));
    const latest = winnerEntries[0];
    const earliest = winnerEntries.at(-1);
    const paragraphs = [
      `Every film recognised in the ${shortName} ${name} category in CineRoll's records: ${films} films across ${years.length} years, ${winnerEntries.length} of them winners.`,
    ];
    if (latest && earliest && latest !== earliest) {
      paragraphs.push(
        `The most recent winner is ${latest.film.title} (${latest.year}); the earliest on record is ${earliest.film.title} (${earliest.year}).`,
      );
    }
    const recent = winnerEntries.slice(0, 3);
    if (recent.length === 3) {
      paragraphs.push(
        `The last three winners were ${listJoin(recent.map((e) => `${e.film.title} (${e.year})`))}.`,
      );
    }
    paragraphs.push("The list is newest first. Each year shows the winner at the top, then the other nominees; a year with enough nominees links to its own page.");
    return paragraphs;
  }

  const { name, shortName, films } = segment.data;
  const winners = films.filter((f) => f.wins > 0);
  const top = films.slice(0, 3).filter((f) => f.wins > 0);
  const years = films.map((f) => f.film.year).filter((y): y is number => typeof y === "number");
  return [
    `${films.length} ${name.toLowerCase()} films have been recognised at the ${shortName}, and ${winners.length} of them won at least one award. They are ranked here by wins, then by nominations.`,
    top.length > 0
      ? `The most awarded are ${listJoin(top.map((f) => `${f.film.title} (${f.wins} ${f.wins === 1 ? "win" : "wins"})`))}.${
          years.length > 1 ? ` The films span ${Math.min(...years)} to ${Math.max(...years)}.` : ""
        }`
      : `None of them has won yet — every film here is a nominee.`,
    `Genres come from each film's catalogue data, so a film can appear under more than one genre. Every title links to its complete record at all four awards.`,
  ];
}
