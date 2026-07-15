import type { Metadata } from "next";
import type { Film } from "@cineroll/types";
import { formatFilmYear } from "@/lib/format";
import { SITE_URL } from "./config";
import { getAwardSeoSummary } from "./award-seo-summary";

export function buildFilmMetadata(film: Film, slug: string): Metadata {
  const filmYear = formatFilmYear(film);
  const title = `${film.title} (${filmYear})`;
  const description = buildDescription(film);
  const socialImage = new URL(
    `/api/og/film/${encodeURIComponent(slug)}`,
    SITE_URL,
  ).toString();
  const pageUrl = new URL(`/film/${slug}`, SITE_URL).toString();
  const image = { url: socialImage, width: 1200, height: 630, alt: title };

  return {
    title,
    description,
    alternates: { canonical: pageUrl },
    openGraph: { title, description, type: "video.movie", url: pageUrl, images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

function buildDescription(film: Film): string {
  const awardSummary = getAwardSeoSummary(film);
  const description = film.plot
    ? `${film.plot} ${awardSummary}`
    : `${film.title}${film.director ? `, directed by ${film.director}` : ""}. ${awardSummary}`;

  return description.length > 155
    ? `${description.slice(0, 152)}…`
    : description;
}
