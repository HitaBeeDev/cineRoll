import { AWARD_BODIES, type AwardBodySlug } from "./awardBodies";
import { findAwardRows } from "./awardsRepository";
import { type AwardEntry, type AwardIndex, buildAwardIndex } from "./buildAwardIndex";
import { summarizeCoverage } from "./summarizeCoverage";

/**
 * A page needs at least this many distinct films to exist. Thinner pages are
 * 404s: a page listing two films is not worth a search result and drags the
 * whole site down.
 */
export const MIN_FILMS_PER_PAGE = 5;

// A day. Award data only changes on a seed; one query per body per instance.
const INDEX_TTL_MS = 24 * 60 * 60 * 1000;
const cache = new Map<AwardBodySlug, { index: AwardIndex; builtAt: number }>();
const inFlight = new Map<AwardBodySlug, Promise<AwardIndex>>();

async function getIndex(body: AwardBodySlug): Promise<AwardIndex> {
  const cached = cache.get(body);
  if (cached && Date.now() - cached.builtAt < INDEX_TTL_MS) return cached.index;

  const pending = inFlight.get(body);
  if (pending) return pending;

  const build = findAwardRows(body)
    .then(rows => {
      const index = buildAwardIndex(body, rows);
      cache.set(body, { index, builtAt: Date.now() });
      return index;
    })
    .finally(() => inFlight.delete(body));
  inFlight.set(body, build);
  return build;
}

function neighbours(sorted: number[], value: number) {
  const at = sorted.indexOf(value);
  return { prev: sorted[at - 1] ?? null, next: sorted[at + 1] ?? null };
}

function validYears(index: AwardIndex): number[] {
  return [...index.years]
    .filter(([, year]) => year.filmSlugs.size >= MIN_FILMS_PER_PAGE)
    .map(([year]) => year)
    .sort((a, b) => a - b);
}

function validCategoryYears(index: AwardIndex, slug: string): number[] {
  const bucket = index.categories.get(slug);
  if (!bucket) return [];
  return [...bucket.byYear]
    .filter(([, entries]) => new Set(entries.map(e => e.film.slug)).size >= MIN_FILMS_PER_PAGE)
    .map(([year]) => year)
    .sort((a, b) => a - b);
}

/** Genres with enough films and no clash with a category slug (the URL is shared). */
function validGenres(index: AwardIndex): string[] {
  return [...index.genres]
    .filter(([slug, genre]) => genre.films.size >= MIN_FILMS_PER_PAGE && !index.categories.has(slug))
    .map(([slug]) => slug);
}

function categoryName(index: AwardIndex, slug: string): string {
  return index.categories.get(slug)?.name ?? slug;
}

/** Everything one body has on record, thin years included — for /data and /methodology. */
export async function getAwardCoverage(body: AwardBodySlug) {
  return { body, ...AWARD_BODIES[body], ...summarizeCoverage(await getIndex(body)) };
}

/** The hub for one body: every year and every category with enough films. */
export async function getAwardBody(body: AwardBodySlug) {
  const index = await getIndex(body);

  const years = validYears(index).map(year => {
    const bucket = index.years.get(year)!;
    const wins = [...bucket.byCategory.values()].flat().filter(entry => entry.won).length;
    return { year, films: bucket.filmSlugs.size, wins };
  });

  const categories = [...index.categories]
    .filter(([, bucket]) => bucket.filmSlugs.size >= MIN_FILMS_PER_PAGE)
    .map(([slug, bucket]) => {
      const seen = [...bucket.byYear.keys()];
      return {
        slug,
        name: bucket.name,
        films: bucket.filmSlugs.size,
        firstYear: Math.min(...seen),
        lastYear: Math.max(...seen),
      };
    })
    .sort((a, b) => b.films - a.films);

  const genres = validGenres(index)
    .map(slug => ({ slug, name: index.genres.get(slug)!.name, films: index.genres.get(slug)!.films.size }))
    .sort((a, b) => b.films - a.films);

  return { body, ...AWARD_BODIES[body], years, categories, genres };
}

/** One ceremony: every category that year, winners first. Null if too thin. */
export async function getAwardYear(body: AwardBodySlug, year: number) {
  const index = await getIndex(body);
  const bucket = index.years.get(year);
  if (!bucket || bucket.filmSlugs.size < MIN_FILMS_PER_PAGE) return null;

  const categories = [...bucket.byCategory]
    .map(([slug, entries]) => ({ slug, name: categoryName(index, slug), entries }))
    .sort((a, b) => b.entries.length - a.entries.length || a.name.localeCompare(b.name));

  return {
    body,
    ...AWARD_BODIES[body],
    year,
    films: bucket.filmSlugs.size,
    ...neighbours(validYears(index), year),
    categories,
  };
}

/** One category across all its years, newest first. Null if too thin. */
export async function getAwardCategory(body: AwardBodySlug, slug: string) {
  const index = await getIndex(body);
  const bucket = index.categories.get(slug);
  if (!bucket || bucket.filmSlugs.size < MIN_FILMS_PER_PAGE) return null;

  const linkable = new Set(validCategoryYears(index, slug));
  const years = [...bucket.byYear]
    .sort(([a], [b]) => b - a)
    .map(([year, entries]) => ({ year, hasPage: linkable.has(year), entries }));

  return { body, ...AWARD_BODIES[body], slug, name: bucket.name, films: bucket.filmSlugs.size, years };
}

/** One category in one year. Null if too thin. */
export async function getAwardCategoryYear(body: AwardBodySlug, slug: string, year: number) {
  const index = await getIndex(body);
  const entries: AwardEntry[] | undefined = index.categories.get(slug)?.byYear.get(year);
  if (!entries || new Set(entries.map(e => e.film.slug)).size < MIN_FILMS_PER_PAGE) return null;

  return {
    body,
    ...AWARD_BODIES[body],
    slug,
    name: categoryName(index, slug),
    year,
    ...neighbours(validCategoryYears(index, slug), year),
    entries,
  };
}

/** One genre's films at this body, most wins first. Null if too thin. */
export async function getAwardGenre(body: AwardBodySlug, slug: string) {
  const index = await getIndex(body);
  if (!validGenres(index).includes(slug)) return null;

  const genre = index.genres.get(slug)!;
  const films = [...genre.films.values()].sort(
    (a, b) => b.wins - a.wins || b.nominations - a.nominations || a.film.title.localeCompare(b.film.title),
  );
  return { body, ...AWARD_BODIES[body], slug, name: genre.name, films };
}

/** Every award page that exists, for the sitemap. */
export async function getAwardPaths(): Promise<string[]> {
  const paths = ["/awards"];

  for (const body of Object.keys(AWARD_BODIES) as AwardBodySlug[]) {
    const index = await getIndex(body);
    paths.push(`/awards/${body}`);
    for (const year of validYears(index)) paths.push(`/awards/${body}/${year}`);
    for (const slug of validGenres(index)) paths.push(`/awards/${body}/${slug}`);
    for (const [slug, bucket] of index.categories) {
      if (bucket.filmSlugs.size < MIN_FILMS_PER_PAGE) continue;
      paths.push(`/awards/${body}/${slug}`);
      for (const year of validCategoryYears(index, slug)) {
        paths.push(`/awards/${body}/${slug}/${year}`);
      }
    }
  }

  return paths;
}

export type FilmAwardLink = { href: string; label: string; kind: "year" | "category" | "category-year" | "genre" };

/**
 * Every award page a film appears on that actually exists (the five-film rule
 * applied), so a film page can link to them without ever pointing at a 404.
 */
export async function getFilmAwardLinks(filmSlug: string): Promise<FilmAwardLink[]> {
  const links: FilmAwardLink[] = [];

  for (const body of Object.keys(AWARD_BODIES) as AwardBodySlug[]) {
    const index = await getIndex(body);
    const { shortName } = AWARD_BODIES[body];
    const years = new Set(validYears(index));

    for (const [year, bucket] of index.years) {
      if (bucket.filmSlugs.has(filmSlug) && years.has(year)) {
        links.push({ href: `/awards/${body}/${year}`, label: `${year} ${shortName}`, kind: "year" });
      }
    }

    for (const [slug, bucket] of index.categories) {
      if (!bucket.filmSlugs.has(filmSlug) || bucket.filmSlugs.size < MIN_FILMS_PER_PAGE) continue;
      links.push({ href: `/awards/${body}/${slug}`, label: `${shortName}: ${bucket.name}`, kind: "category" });

      const categoryYears = new Set(validCategoryYears(index, slug));
      for (const [year, entries] of bucket.byYear) {
        if (categoryYears.has(year) && entries.some(entry => entry.film.slug === filmSlug)) {
          links.push({
            href: `/awards/${body}/${slug}/${year}`,
            label: `${year} ${shortName} ${bucket.name}`,
            kind: "category-year",
          });
        }
      }
    }

    for (const slug of validGenres(index)) {
      const genre = index.genres.get(slug);
      if (genre?.films.has(filmSlug)) {
        links.push({ href: `/awards/${body}/${slug}`, label: `${genre.name} films at the ${shortName}`, kind: "genre" });
      }
    }
  }

  return links;
}
