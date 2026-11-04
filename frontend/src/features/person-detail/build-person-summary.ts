import type { AwardRow, PersonData } from "./domain-types";

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

function listJoin(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
}

/**
 * A short written summary of a person's award record, built from the same data
 * as the page: counts per award, the span of their recognition, a couple of
 * wins, and films they directed. Gives every person page real text to rank on
 * — most people have no bio. Null when there is no record to summarise.
 */
export function buildPersonSummary(person: PersonData): string | null {
  if (person.totalNominations === 0) return null;

  const bodies = [
    { short: "the Oscars", records: person.oscarRecords },
    { short: "the Golden Globes", records: person.ggRecords },
    { short: "Cannes", records: person.cannesRecords },
  ].filter((body) => body.records.length > 0);

  const sentences: string[] = [];

  const wins = person.totalWins > 0 ? ` and ${plural(person.totalWins, "win")}` : "";
  const perBody =
    bodies.length > 1
      ? ` — ${listJoin(bodies.map((body) => `${body.records.length} at ${body.short}`))}`
      : ` at ${bodies[0]?.short}`;
  sentences.push(
    `In CineRoll's records, ${person.name} earned ${plural(person.totalNominations, "nomination")}${wins}${perBody}.`,
  );

  const all: AwardRow[] = bodies.flatMap((body) => body.records);
  const byYear = [...all].sort((a, b) => a.awardYear - b.awardYear);
  const first = byYear[0];
  const last = byYear.at(-1);
  if (first && last) {
    sentences.push(
      first.awardYear === last.awardYear
        ? `All of it came in ${first.awardYear}, for ${first.filmTitle}.`
        : `The first recognition came in ${first.awardYear} for ${first.filmTitle}; the most recent in ${last.awardYear} for ${last.filmTitle}.`,
    );
  }

  const recentWins = all
    .filter((record) => record.won)
    .sort((a, b) => b.awardYear - a.awardYear)
    .slice(0, 2)
    .map((record) => `${record.category} for ${record.filmTitle} (${record.awardYear})`);
  if (recentWins.length > 0) sentences.push(`Wins include ${listJoin(recentWins)}.`);

  const directed = person.films.filter((film) => film.role === "director").length;
  if (directed > 0) {
    sentences.push(`${plural(directed, "film")} they directed ${directed === 1 ? "is" : "are"} in the catalogue.`);
  }

  return sentences.join(" ");
}
