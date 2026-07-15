import type { RollFilm } from "@/lib/api";

export type ShareBattleWinnerResult = "shared" | "copied" | "cancelled";

export async function shareBattleWinner(
  film: RollFilm,
): Promise<ShareBattleWinnerResult> {
  const url = buildWinnerUrl(film.slug);
  const text = `🎬 Roll Battle picked "${film.title}" (${film.year}) as my film tonight! Try it on CineRoll: ${url}`;

  try {
    if (navigator.share) {
      await navigator.share({ title: "Roll Battle Result", text, url });
      return "shared";
    }
    await navigator.clipboard.writeText(url);
    return "copied";
  } catch {
    return "cancelled";
  }
}

function buildWinnerUrl(slug: string): string {
  const url = new URL("/roll-battle/result", window.location.origin);
  url.searchParams.set("film", slug);
  return url.toString();
}
