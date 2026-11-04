import type { Film } from "@cineroll/types";

const totalWins = (film: Film) => film.oscarWins + film.ggWins + film.cannesWins + film.berlinWins;

function listJoin(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
}

/**
 * Plain sentences about a list of films, from the films themselves: which won
 * the most, how many won at each award, and the years they span. Every list
 * page gets intro text that is true and unique to it, not filler.
 */
export function describeFilmList(films: Film[], total: number): string[] {
  if (films.length === 0) return [];
  const sentences: string[] = [];
  const scope = total > films.length ? `Among the ${films.length} shown here` : "Among them";

  const ranked = [...films].sort((a, b) => totalWins(b) - totalWins(a));
  const [top, second, third] = ranked;
  if (top && totalWins(top) > 0) {
    const followers = [second, third]
      .filter((film): film is Film => Boolean(film) && totalWins(film as Film) > 0)
      .map((film) => `${film.title} (${totalWins(film)})`);
    sentences.push(
      `The most awarded is ${top.title} (${top.year}), with ${totalWins(top)} wins${
        followers.length ? `, followed by ${listJoin(followers)}` : ""
      }.`,
    );
  }

  const atBody = [
    { count: films.filter((film) => film.oscarWins > 0).length, label: "at least one Oscar" },
    { count: films.filter((film) => film.ggWins > 0).length, label: "a Golden Globe" },
    { count: films.filter((film) => film.cannesWins > 0).length, label: "a prize at Cannes" },
    { count: films.filter((film) => film.berlinWins > 0).length, label: "a prize at the Berlinale" },
  ].filter((body) => body.count > 0);
  if (atBody.length > 0) {
    sentences.push(`${scope}, ${listJoin(atBody.map((body) => `${body.count} won ${body.label}`))}.`);
  }

  const years = films.map((film) => film.year).filter((year) => year > 0);
  if (years.length > 1) {
    const first = Math.min(...years);
    const last = Math.max(...years);
    if (first !== last) sentences.push(`They were released between ${first} and ${last}.`);
  }

  return sentences;
}
