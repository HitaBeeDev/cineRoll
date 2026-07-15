import type { AwardRecord } from "@cineroll/types";
import type { RollFilm } from "@/lib/api";
import type { PickSlot } from "./domain-types";

const AWARD_BODY_LABEL: Record<AwardRecord["awardBody"], string> = {
  oscar: "the Academy Awards",
  goldenglobe: "the Golden Globes",
  cannes: "the Festival de Cannes",
  berlin: "the Berlinale",
};

const FLAGSHIP_CATEGORY =
  /best picture|best motion picture|best film|palme d'?or|grand prix|best director|best foreign/i;

export function getPickRationale(film: RollFilm, slot: PickSlot): string {
  const headlineWin = getHeadlineWin(film);
  if (slot.num === "01") return getPrestigeRationale(film, headlineWin);
  if (slot.num === "02") return getWorldCinemaRationale(film, headlineWin);
  if (slot.num === "03" && film.imdbRating != null) {
    const isOutsideTopLists =
      film.imdbTopMovieRank == null && film.imdbTopTvRank == null;
    return isOutsideTopLists
      ? `Rated ${film.imdbRating.toFixed(1)} on IMDb yet outside the Top 250 — acclaim the canon overlooked.`
      : `Rated ${film.imdbRating.toFixed(1)} on IMDb — a highly regarded discovery for tonight.`;
  }
  if (film.plot) return getFirstSentence(film.plot);
  return `Tonight's ${slot.label.toLowerCase()} pick.`;
}

function getHeadlineWin(film: RollFilm): AwardRecord | null {
  return (
    getTopWin(film.oscarCategories) ??
    getTopWin(film.cannesCategories) ??
    getTopWin(film.ggCategories)
  );
}

function getTopWin(records: AwardRecord[]): AwardRecord | null {
  const wins = records.filter((record) => record.won);
  return (
    wins.find((record) => FLAGSHIP_CATEGORY.test(record.category)) ??
    wins[0] ??
    null
  );
}

function getPrestigeRationale(
  film: RollFilm,
  headlineWin: AwardRecord | null,
): string {
  if (headlineWin) return formatAwardWin(headlineWin, "Won");
  const wins = film.oscarWins + film.ggWins + film.cannesWins;
  if (wins > 0) {
    return `${wins} major award win${wins > 1 ? "s" : ""}, including the Academy Awards.`;
  }
  return film.plot ? getFirstSentence(film.plot) : "Tonight's award prestige pick.";
}

function getWorldCinemaRationale(
  film: RollFilm,
  headlineWin: AwardRecord | null,
): string {
  const cannesWin = getTopWin(film.cannesCategories);
  if (cannesWin) return formatAwardWin(cannesWin, cannesWin.category);
  if (headlineWin) {
    return `An international standout — ${headlineWin.category}, ${headlineWin.awardYear}.`;
  }
  return film.plot ? getFirstSentence(film.plot) : "Tonight's world cinema pick.";
}

function formatAwardWin(record: AwardRecord, prefix: string): string {
  const category = prefix === record.category ? prefix : `${prefix} ${record.category}`;
  return `${category} at ${AWARD_BODY_LABEL[record.awardBody]}, ${record.awardYear}.`;
}

function getFirstSentence(text: string): string {
  const trimmed = text.trim();
  const sentenceEnd = trimmed.indexOf(". ");
  return sentenceEnd > 40 ? trimmed.slice(0, sentenceEnd + 1) : trimmed;
}
