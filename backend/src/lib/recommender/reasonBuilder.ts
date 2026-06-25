import { filmFeatureKeys, TasteProfileVectors } from "../tasteProfile";
import { SCORE_DIMENSIONS } from "./constants";
import { CandidateFilm } from "./types";

const AWARD_PHRASE: Record<string, string> = {
  berlin_nominee: "follow the Berlinale",
  berlin_winner: "favor Berlinale winners",
  cannes_nominee: "follow Cannes",
  cannes_winner: "favor Cannes winners",
  gg_nominee: "follow the Golden Globes",
  gg_winner: "favor Golden Globe winners",
  oscar_nominee: "follow the Oscars",
  oscar_winner: "favor Oscar winners",
};

type ReasonPart = {
  text: string;
  weight: number;
};

export function buildReason(
  film: CandidateFilm,
  taste: TasteProfileVectors,
  likedByGenre: Map<string, string>,
): string {
  const topGenre = strongestMatchingGenre(film, taste);
  const phrases = reasonPhrases(film, taste, likedByGenre, topGenre);

  if (phrases.length === 0) {
    return fallbackReason(film);
  }

  return `Because you ${phrases.slice(0, 2).join(" and ")}.`;
}

function reasonPhrases(
  film: CandidateFilm,
  taste: TasteProfileVectors,
  likedByGenre: Map<string, string>,
  topGenre: ReasonPart | null,
): string[] {
  const phrases: string[] = [];
  const anchorTitle = topGenre ? likedByGenre.get(topGenre.text) : undefined;

  if (anchorTitle) phrases.push(`liked ${anchorTitle}`);

  for (const part of matchingReasonParts(film, taste, topGenre)) {
    if (phrases.length >= 2) break;
    phrases.push(part.text);
  }

  return phrases;
}

function matchingReasonParts(
  film: CandidateFilm,
  taste: TasteProfileVectors,
  topGenre: ReasonPart | null,
): ReasonPart[] {
  const features = filmFeatureKeys(film);
  const parts: ReasonPart[] = [];

  if (topGenre) {
    parts.push({ text: `watch a lot of ${topGenre.text}`, weight: topGenre.weight });
  }

  if (features.director) {
    const weight = taste.directorWeights[features.director] ?? 0;
    if (weight > 0) {
      parts.push({ text: `like ${features.director}`, weight: SCORE_DIMENSIONS.director * weight });
    }
  }

  for (const award of features.awards) {
    const weight = taste.awardAffinity[award] ?? 0;
    if (weight > 0 && AWARD_PHRASE[award]) {
      parts.push({ text: AWARD_PHRASE[award]!, weight: SCORE_DIMENSIONS.award * weight });
    }
  }

  if (features.decade) {
    const weight = taste.decadeWeights[features.decade] ?? 0;
    if (weight > 0) {
      parts.push({ text: `enjoy ${features.decade} films`, weight: SCORE_DIMENSIONS.decade * weight });
    }
  }

  return parts.sort((a, b) => b.weight - a.weight);
}

function strongestMatchingGenre(
  film: CandidateFilm,
  taste: TasteProfileVectors,
): ReasonPart | null {
  let strongest: ReasonPart | null = null;

  for (const genre of filmFeatureKeys(film).genres) {
    const weight = taste.genreWeights[genre] ?? 0;
    if (weight > (strongest?.weight ?? 0)) {
      strongest = { text: genre, weight };
    }
  }

  return strongest;
}

function fallbackReason(film: CandidateFilm): string {
  const genre = film.genres[0];

  return genre ? `A highly rated ${genre} pick.` : "A highly rated award pick.";
}
