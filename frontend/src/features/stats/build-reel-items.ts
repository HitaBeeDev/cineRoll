import { createPersonSlug } from "./create-person-slug";
import type { ReelItem, StatsResponse } from "./types";

export function buildReelItems(stats: StatsResponse): ReelItem[] {
  return [
    buildCompetitiveYearItem(stats),
    buildFilmItem(stats.topWinningFilms[0], "Most awarded film", "wins", "red"),
    buildFilmItem(stats.topNominatedFilms[0], "Most nominated film", "nominations", "blue"),
    buildPersonItem(stats),
  ].filter((item): item is ReelItem => item !== null);
}

function buildCompetitiveYearItem(stats: StatsResponse): ReelItem | null {
  const year = stats.mostCompetitiveYear;
  if (!year) return null;
  return {
    eyebrow: "Most competitive year",
    title: String(year.awardYear),
    value: year.totalNominations.toLocaleString(),
    sub: "nominations",
    href: `#decade-${Math.floor(year.awardYear / 10) * 10}`,
    accent: "red",
  };
}

function buildFilmItem(
  film: StatsResponse["topWinningFilms"][number] | undefined,
  eyebrow: string,
  sub: string,
  accent: ReelItem["accent"],
): ReelItem | null {
  if (!film) return null;
  return { eyebrow, title: film.title, value: String(film.count), sub, href: `/film/${film.slug}`, accent };
}

function buildPersonItem(stats: StatsResponse): ReelItem | null {
  const person = stats.topNominatedPeople[0];
  if (!person) return null;
  return {
    eyebrow: "Most nominated person",
    title: person.name,
    value: String(person.count),
    sub: "nominations",
    href: `/person/${createPersonSlug(person.name)}`,
    accent: "blue",
  };
}
