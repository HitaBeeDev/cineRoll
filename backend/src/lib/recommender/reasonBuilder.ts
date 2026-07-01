import { filmFeatureKeys, TasteProfileVectors } from "../tasteProfile";
import { SCORE_DIMENSIONS } from "./constants";
import { CandidateFilm } from "./types";

const AWARD_LABEL = {
  oscar: "Oscar",
  cannes: "Cannes",
  gg: "Golden Globe",
  berlin: "Berlinale",
} as const;

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
  coldStart: boolean,
  index: number,
): string {
  const topGenre = strongestMatchingGenre(film, taste);

  // Cold-start users have onboarding genre preferences but no watch history, so
  // "Because you watch a lot of X" would be a lie repeated on every card. Speak
  // honestly about the film's own pedigree and the genres they picked, and
  // rotate the angle by card position so the grid never reads as one string.
  if (coldStart) {
    return coldStartReason(film, topGenre?.text ?? null, index);
  }

  const phrases = reasonPhrases(film, taste, likedByGenre, topGenre);

  if (phrases.length === 0) {
    return fallbackReason(film);
  }

  return `Because you ${phrases.slice(0, 2).join(" and ")}.`;
}

/**
 * Honest, source-aware explanation for a viewer who has rated nothing yet. Each
 * film exposes several true angles (acclaim, rating, era, the starting genre it
 * matches); we rotate which one leads by card index so adjacent cards differ
 * even when they share the same pedigree.
 */
function coldStartReason(
  film: CandidateFilm,
  genre: string | null,
  index: number,
): string {
  const g = genre ?? film.genres[0] ?? null;
  const hooks = coldStartHooks(film, g);

  if (hooks.length === 0) {
    return fallbackReason(film);
  }

  return hooks[index % hooks.length]!;
}

function coldStartHooks(film: CandidateFilm, g: string | null): string[] {
  const hooks: string[] = [];
  const noun = g ?? "film";

  const rank = film.imdbTopMovieRank ?? film.imdbTopTvRank;
  if (rank != null) {
    hooks.push(`#${rank} on IMDb's Top 250 — start rating to calibrate.`);
  }

  const win = topAward(film, "win");
  if (win) {
    hooks.push(`A ${win}-winning ${noun} — a canonical pick to start rating.`);
  } else {
    const nom = topAward(film, "nomination");
    if (nom) hooks.push(`A ${nom}-nominated ${noun} to start rating.`);
  }

  if (film.imdbRating != null && film.imdbRating >= 7.5) {
    hooks.push(
      g
        ? `Among the highest-rated ${g} films.`
        : "Among the highest-rated films to start rating.",
    );
  }

  const decade = filmFeatureKeys(film).decade;
  if (decade && g) {
    hooks.push(`A ${decade} ${g} to widen your taste.`);
  }

  if (g) {
    hooks.push(`Popular in ${g} — one of your starting genres.`);
  }

  return hooks;
}

function topAward(film: CandidateFilm, kind: "win" | "nomination"): string | null {
  const bodies: Array<[number, string]> =
    kind === "win"
      ? [
          [film.oscarWins, AWARD_LABEL.oscar],
          [film.cannesWins, AWARD_LABEL.cannes],
          [film.ggWins, AWARD_LABEL.gg],
          [film.berlinWins, AWARD_LABEL.berlin],
        ]
      : [
          [film.oscarNominations, AWARD_LABEL.oscar],
          [film.cannesNominations, AWARD_LABEL.cannes],
          [film.ggNominations, AWARD_LABEL.gg],
          [film.berlinNominations, AWARD_LABEL.berlin],
        ];

  for (const [count, label] of bodies) {
    if (count > 0) return label;
  }

  return null;
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
