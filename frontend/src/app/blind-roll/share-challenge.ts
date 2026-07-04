import type { Difficulty } from "./types";

const SHARE_RESET_DELAY_MS = 2200;

export async function shareBlindRollChallenge(filmSlug: string, difficulty: Difficulty): Promise<boolean> {
  if (typeof window === "undefined") return false;

  const shareUrl = buildChallengeUrl(filmSlug, difficulty);
  const text = "Can you crack this CineRoll blind roll?";

  try {
    if (navigator.share) {
      await navigator.share({
        title: "CineRoll Blind Roll",
        text,
        url: shareUrl,
      });
    } else {
      await navigator.clipboard.writeText(shareUrl);
    }

    return true;
  } catch {
    return false;
  }
}

export function resetShareStatusLater(onReset: () => void) {
  window.setTimeout(onReset, SHARE_RESET_DELAY_MS);
}

function buildChallengeUrl(filmSlug: string, difficulty: Difficulty): string {
  const url = new URL(window.location.href);
  url.searchParams.set("film", filmSlug);
  url.searchParams.set("difficulty", difficulty);
  return url.toString();
}
