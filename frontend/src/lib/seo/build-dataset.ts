import type { BodyCoverage } from "@/features/methodology/coverage-types";
import { absoluteUrl } from "./absolute-url";

/**
 * schema.org Dataset describing the award catalogue, for /methodology. Every
 * number is passed in from live data; anything unknown is left out, never guessed.
 */
export function buildDataset({
  coverage,
  filmCount,
  updatedAt,
}: {
  coverage: BodyCoverage[];
  filmCount: number | null;
  updatedAt: string | null;
}) {
  const first = coverage.length > 0 ? Math.min(...coverage.map((body) => body.firstYear)) : null;
  const last = coverage.length > 0 ? Math.max(...coverage.map((body) => body.lastYear)) : null;
  const size = filmCount ? `${filmCount.toLocaleString("en-US")} films and series` : "Films and series";

  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "CineRoll award film catalogue",
    description: `${size} nominated at the Academy Awards, Golden Globes, Cannes Film Festival and Berlin International Film Festival, each matched to one TMDB record with its full nomination and win history, plus IMDb and Rotten Tomatoes ratings.`,
    url: absoluteUrl("/methodology"),
    creator: { "@id": absoluteUrl("/#organization") },
    isAccessibleForFree: true,
    keywords: ["Academy Awards", "Golden Globes", "Cannes Film Festival", "Berlinale", "film awards", "nominations"],
    ...(first && last ? { temporalCoverage: `${first}/${last}` } : {}),
    ...(updatedAt ? { dateModified: updatedAt } : {}),
    variableMeasured: ["award body", "award category", "ceremony year", "won or nominated", "IMDb rating", "Rotten Tomatoes score"],
    isBasedOn: [
      "https://www.themoviedb.org",
      "https://www.omdbapi.com",
    ],
  };
}
