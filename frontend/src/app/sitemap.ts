import type { MetadataRoute } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://cineroll.app");

// Rebuild at most once a day — the film catalog changes rarely and we don't want
// to hammer the API (one request per 100 films) on every crawler hit.
export const revalidate = 86400;

const PAGE_SIZE = 100;
// Safety cap so a bad `totalPages` can never fan out into thousands of requests.
const MAX_PAGES = 500;

type FilmListPage = {
  films: { slug: string }[];
  totalPages: number;
};

async function fetchPage(page: number): Promise<FilmListPage | null> {
  try {
    const res = await fetch(`${API_URL}/api/films?limit=${PAGE_SIZE}&page=${page}`, {
      next: { revalidate },
    });
    if (!res.ok) return null;
    return (await res.json()) as FilmListPage;
  } catch {
    return null;
  }
}

// Page through GET /api/films (capped at 100/page server-side) to collect every slug.
async function fetchFilmSlugs(): Promise<string[]> {
  const first = await fetchPage(1);
  if (!first) return [];

  const slugs = first.films.map((f) => f.slug);
  const totalPages = Math.min(first.totalPages ?? 1, MAX_PAGES);
  if (totalPages <= 1) return slugs;

  const rest = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, i) => fetchPage(i + 2)),
  );

  return slugs.concat(...rest.map((p) => p?.films.map((f) => f.slug) ?? []));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/browse`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
  ];

  const slugs = await fetchFilmSlugs();
  const filmRoutes: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${SITE_URL}/film/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...filmRoutes];
}
