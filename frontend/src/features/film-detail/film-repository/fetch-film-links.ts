import { API_URL } from "@/lib/api/constants/api-url";

export type FilmAwardLink = {
  href: string;
  label: string;
  kind: "year" | "category" | "category-year" | "genre";
};

export type FilmLinks = {
  awardPages: FilmAwardLink[];
  originCountries: string[];
  language: string | null;
};

/**
 * The hub pages a film belongs on — award years, categories, genres — as the
 * backend lists them (only pages that exist), plus its origin countries and
 * language. Null on any failure: the film page simply drops the section.
 */
export async function fetchFilmLinks(slug: string): Promise<FilmLinks | null> {
  try {
    const response = await fetch(`${API_URL}/api/awards/film/${encodeURIComponent(slug)}`, {
      next: { revalidate: 86400 },
    });
    if (!response.ok) return null;
    return (await response.json()) as FilmLinks;
  } catch {
    return null;
  }
}
