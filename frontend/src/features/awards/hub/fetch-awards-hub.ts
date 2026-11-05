import { fetchFilm } from "@/features/film-detail/film-repository/fetch-film";
import { tmdbImageUrl } from "@/lib/images/tmdb-image-url";
import { AWARD_BODIES } from "../award-bodies";
import { fetchAllCoverage } from "../fetch-all-coverage";
import { fetchTopPrizeWinners } from "./fetch-top-prize-winners";
import type { AwardsHubData, HubImage, TopPrizeWinners, YearCell, YearRow } from "./hub-types";

/** The film's wide backdrop, falling back to its poster; null if it has neither or the fetch fails. */
async function backdropFor(slug: string): Promise<string | null> {
  try {
    const film = await fetchFilm(slug);
    return tmdbImageUrl(film?.backdropUrl ?? film?.posterUrl, "w780");
  } catch {
    return null;
  }
}

/**
 * Walk a body's winners newest-first and take the first film not already used
 * elsewhere on the page, so the hero and the cards never repeat a film (one
 * film can win two top prizes in the same season).
 */
function nextUnused(data: TopPrizeWinners, used: Set<string>, needPoster: boolean) {
  for (const { year, films } of data.winners) {
    for (const film of films) {
      if (used.has(film.slug) || (needPoster && !film.posterUrl)) continue;
      used.add(film.slug);
      return { film, year };
    }
  }
  return null;
}

function buildYears(bodies: TopPrizeWinners[]): YearRow[] {
  const allYears = bodies.flatMap((body) => body.recordedYears);
  if (allYears.length === 0) return [];
  const first = Math.min(...allYears);
  const last = Math.max(...allYears);

  const lookups = bodies.map((body) => ({
    body,
    shortName: AWARD_BODIES.find((entry) => entry.slug === body.slug)?.shortName ?? body.slug,
    winners: new Map(body.winners.map((row) => [row.year, row.films])),
    pages: new Set(body.ceremonyPageYears),
    recorded: new Set(body.recordedYears),
  }));

  const rows: YearRow[] = [];
  for (let year = first; year <= last; year += 1) {
    const cells: YearCell[] = lookups.map(({ body, shortName, winners, pages, recorded }) => {
      const films = (winners.get(year) ?? []).map(({ slug, title, year: filmYear, posterUrl }) => ({
        slug,
        title,
        year: filmYear,
        posterUrl: tmdbImageUrl(posterUrl, "w185"),
      }));
      return {
        slug: body.slug,
        shortName,
        prize: body.prize,
        status: films.length > 0 ? "winners" : recorded.has(year) ? "no-winner" : "none",
        films,
        ceremonyHref: pages.has(year) ? `/awards/${body.slug}/${year}` : null,
      };
    });
    rows.push({ year, cells });
  }
  return rows;
}

/**
 * Everything the /awards hub draws from real records: hero posters and card
 * backdrops from top-prize winners, and the year explorer's rows. A body whose
 * data cannot be fetched is simply left out of the imagery and the explorer.
 */
export async function fetchAwardsHub(): Promise<AwardsHubData> {
  const coverage = await fetchAllCoverage().catch(() => []);
  const results = await Promise.all(
    AWARD_BODIES.map((body) =>
      fetchTopPrizeWinners(body, coverage.find((entry) => entry.body === body.slug)),
    ),
  );
  const bodies = results.filter((body): body is TopPrizeWinners => body !== null);

  const used = new Set<string>();
  const cardPicks = bodies.map((body) => ({ body, pick: nextUnused(body, used, false) }));
  const heroPicks = bodies.map((body) => ({ body, pick: nextUnused(body, used, true) }));

  const cardEntries = await Promise.all(
    cardPicks.map(async ({ body, pick }) => {
      if (!pick) return [body.slug, undefined] as const;
      const src = await backdropFor(pick.film.slug);
      const image: HubImage | undefined = src
        ? { slug: pick.film.slug, title: pick.film.title, year: pick.year, prize: body.prize, src }
        : undefined;
      return [body.slug, image] as const;
    }),
  );

  const heroPosters: HubImage[] = heroPicks.flatMap(({ body, pick }) => {
    const src = pick ? tmdbImageUrl(pick.film.posterUrl, "w342") : null;
    return pick && src
      ? [{ slug: pick.film.slug, title: pick.film.title, year: pick.year, prize: body.prize, src }]
      : [];
  });

  return {
    heroPosters,
    cardImages: Object.fromEntries(cardEntries),
    years: buildYears(bodies),
  };
}
