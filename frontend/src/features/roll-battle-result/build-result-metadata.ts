import type { Film } from "@cineroll/types";
import type { Metadata } from "next";
import { formatRollBattleAwardSummary } from "./format-award-summary";

export function buildRollBattleResultMetadata(film: Film): Metadata {
  const title = `Roll Battle picked ${film.title}`;
  const description = `${film.title} (${film.year}) won a CineRoll head-to-head battle. ${formatRollBattleAwardSummary(film)}.`;
  const images = film.posterUrl
    ? [{ url: film.posterUrl, alt: film.title }]
    : [];

  return {
    title,
    description,
    openGraph: { title, description, images },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: film.posterUrl ? [film.posterUrl] : [],
    },
  };
}
