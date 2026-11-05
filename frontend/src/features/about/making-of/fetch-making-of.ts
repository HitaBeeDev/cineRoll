import type { Film } from "@cineroll/types";
import { AWARD_BODIES } from "@/features/awards/award-bodies";
import { fetchAllCoverage } from "@/features/awards/fetch-all-coverage";
import { fetchTopPrizeWinners } from "@/features/awards/hub/fetch-top-prize-winners";
import type { TopPrizeWinners } from "@/features/awards/hub/hub-types";
import { fetchFilm } from "@/features/film-detail/film-repository/fetch-film";
import { tmdbImageUrl } from "@/lib/images/tmdb-image-url";
import type { DemoFilm, MakingOfData, MatchExample, Spotlight, SpotlightBody } from "./making-of-types";

const POOL_SIZE = 18;
const MATCH_CANDIDATES = 8;

const RECORD_FIELDS = [
  { key: "oscar", name: "Oscars", wins: "oscarWins", noms: "oscarNominations", list: "oscarCategories" },
  { key: "goldenglobe", name: "Golden Globes", wins: "ggWins", noms: "ggNominations", list: "ggCategories" },
  { key: "cannes", name: "Cannes", wins: "cannesWins", noms: "cannesNominations", list: "cannesCategories" },
  { key: "berlin", name: "Berlinale", wins: "berlinWins", noms: "berlinNominations", list: "berlinCategories" },
] as const;

async function safeFilm(slug: string): Promise<Film | null> {
  try {
    return await fetchFilm(slug);
  } catch {
    return null;
  }
}

/**
 * Every top-prize winner with its badges, newest first. One film can hold
 * several top prizes (Rain Man: Best Picture and the Golden Bear), so badges
 * are merged per film.
 */
function collectWinners(bodies: TopPrizeWinners[]) {
  const films = new Map<string, DemoFilm & { latest: number }>();
  for (const body of bodies) {
    const shortName = AWARD_BODIES.find((entry) => entry.slug === body.slug)?.shortName ?? body.slug;
    for (const { year, films: winners } of body.winners) {
      for (const film of winners) {
        const posterUrl = tmdbImageUrl(film.posterUrl, "w342");
        if (!posterUrl) continue;
        const existing = films.get(film.slug);
        const badge = { body: shortName, prize: body.prize, year };
        if (existing) {
          existing.badges.push(badge);
          existing.latest = Math.max(existing.latest, year);
        } else {
          films.set(film.slug, { slug: film.slug, title: film.title, posterUrl, badges: [badge], latest: year });
        }
      }
    }
  }
  return [...films.values()].sort((a, b) => b.latest - a.latest);
}

function toSpotlight(film: Film): Spotlight {
  const bodies: SpotlightBody[] = RECORD_FIELDS.map((field) => ({
    key: field.key,
    name: field.name,
    wins: film[field.wins],
    nominations: film[field.noms],
    records: [...film[field.list]]
      .sort((a, b) => Number(b.won) - Number(a.won) || a.awardYear - b.awardYear)
      .map((record) => ({ category: record.category, year: record.awardYear, won: record.won })),
  }));
  return {
    slug: film.slug,
    title: film.title,
    year: film.releaseYear,
    posterUrl: tmdbImageUrl(film.posterUrl, "w342"),
    bodies,
  };
}

function toMatch(film: Film): MatchExample {
  return {
    slug: film.slug,
    title: film.title,
    originalTitle: film.originalTitle ?? film.title,
    tmdbId: film.tmdbId,
    posterUrl: tmdbImageUrl(film.posterUrl, "w342"),
    bodies: RECORD_FIELDS.map((field) => ({
      name: field.name,
      wins: film[field.wins],
      nominations: film[field.noms],
    })),
  };
}

/**
 * Real records for the Making Of tour: a pool of top-prize winners for the
 * roll demo, the film with top prizes at the most awards as the spotlight, and
 * a winner whose original title differs from its English one as the matching
 * example. Each part is null/empty on failure so the page still renders.
 */
export async function fetchMakingOf(): Promise<MakingOfData> {
  const coverage = await fetchAllCoverage().catch(() => []);
  const bodies = (
    await Promise.all(
      AWARD_BODIES.map((body) =>
        fetchTopPrizeWinners(body, coverage.find((entry) => entry.body === body.slug)),
      ),
    )
  ).filter((body): body is TopPrizeWinners => body !== null);

  const winners = collectWinners(bodies);
  const pool: DemoFilm[] = winners
    .slice(0, POOL_SIZE)
    .map((film) => ({ slug: film.slug, title: film.title, posterUrl: film.posterUrl, badges: film.badges }));

  // Top prizes at the most different awards; newest breaks the tie.
  const spotlightPick = [...winners].sort(
    (a, b) =>
      new Set(b.badges.map((badge) => badge.body)).size - new Set(a.badges.map((badge) => badge.body)).size ||
      b.latest - a.latest,
  )[0];

  // Festival winners are the likeliest to carry a non-English original title.
  const festivalSlugs = winners
    .filter((film) => film.badges.some((badge) => badge.body === "Cannes" || badge.body === "Berlinale"))
    .slice(0, MATCH_CANDIDATES)
    .map((film) => film.slug);

  const [spotlightFilm, ...candidates] = await Promise.all([
    spotlightPick ? safeFilm(spotlightPick.slug) : Promise.resolve(null),
    ...festivalSlugs.map(safeFilm),
  ]);
  const matchFilm = candidates.find(
    (film) =>
      film?.originalTitle &&
      film.originalTitle.trim().toLowerCase() !== film.title.trim().toLowerCase(),
  );

  return {
    pool,
    spotlight: spotlightFilm ? toSpotlight(spotlightFilm) : null,
    match: matchFilm ? toMatch(matchFilm) : null,
  };
}
