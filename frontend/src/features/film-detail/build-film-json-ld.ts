import type { Film } from "@cineroll/types";
import { SITE_URL } from "./config";

export function buildFilmJsonLd(film: Film): Record<string, unknown> {
  const pageUrl = new URL(`/film/${film.slug}`, SITE_URL).toString();
  const isTv = film.contentType.includes("tv");

  return {
    "@context": "https://schema.org",
    "@type": isTv ? "TVSeries" : "Movie",
    name: film.title,
    ...(film.originalTitle && film.originalTitle !== film.title
      ? { alternateName: film.originalTitle }
      : {}),
    url: pageUrl,
    ...(film.posterUrl ? { image: film.posterUrl } : {}),
    ...(film.plot ? { description: film.plot } : {}),
    ...(film.genres.length ? { genre: film.genres } : {}),
    ...getDateFields(film, isTv),
    ...(film.runtime ? { duration: `PT${film.runtime}M` } : {}),
    ...(film.director ? { director: { "@type": "Person", name: film.director } } : {}),
    ...(film.cast.length ? { actor: getActors(film) } : {}),
    ...(film.imdbId ? { sameAs: `https://www.imdb.com/title/${film.imdbId}/` } : {}),
    ...getAwardField(film),
  };
}

function getDateFields(film: Film, isTv: boolean): Record<string, string> {
  if (!isTv) return { datePublished: String(film.releaseYear) };
  return {
    startDate: String(film.tvStartYear ?? film.releaseYear),
    ...(film.tvEndYear ? { endDate: String(film.tvEndYear) } : {}),
  };
}

function getActors(film: Film) {
  return film.cast.slice(0, 15).map((member) => ({
    "@type": "Person",
    name: member.name,
  }));
}

function getAwardField(film: Film): Record<string, string[]> {
  const awards = getAwardNames(film);
  return awards.length > 0 ? { award: awards } : {};
}

function getAwardNames(film: Film): string[] {
  const awards: string[] = [];
  addAward(awards, film.oscarWins, "Academy Award");
  addAward(awards, film.ggWins, "Golden Globe");
  addAward(awards, film.cannesWins, "Cannes award");
  addAward(awards, film.berlinWins, "Berlinale award");
  return awards;
}

function addAward(awards: string[], count: number, label: string): void {
  if (count > 0) awards.push(`${count} ${label}${count > 1 ? "s" : ""}`);
}
