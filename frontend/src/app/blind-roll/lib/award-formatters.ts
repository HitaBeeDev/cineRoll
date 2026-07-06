import type { RollFilm } from "@/lib/api";
import type { AwardSummary, BlindRollAward, ClueCard, Difficulty } from "../types";

export function getAwards(film: RollFilm): BlindRollAward[] {
  return [...film.oscarCategories, ...film.ggCategories, ...film.cannesCategories].sort(
    (a, b) => a.awardYear - b.awardYear || a.category.localeCompare(b.category),
  );
}

export function getAwardSummary(awards: BlindRollAward[]): AwardSummary | null {
  if (awards.length === 0) return null;

  const bodies = Array.from(new Set(awards.map((award) => formatAwardBody(award.awardBody))));
  const wins = awards.filter((award) => award.won).length;

  return {
    bodies: bodies.join(" · "),
    yearTrail: formatYearTrail(awards.map((award) => award.awardYear)),
    count: awards.length,
    status: getAwardStatus(wins, awards.length),
  };
}

export function getClueCards(film: RollFilm | null, difficulty: Difficulty): ClueCard[] {
  if (!film || difficulty === "hard") return [];

  const cards = [{ label: "Film Release Decade", value: getDecade(film.year) }];

  if (difficulty === "easy") {
    cards.push({ label: "Genre", value: formatGenres(film.genres) });
  }

  return cards;
}

export function formatAwardBody(body: BlindRollAward["awardBody"]): string {
  if (body === "oscar") return "Oscar";
  if (body === "goldenglobe") return "Golden Globe";
  return "Cannes";
}

export function compactCategory(category: string): string {
  const normalized = category
    .replace(/\s*[-–—]\s*Motion Picture.*$/i, "")
    .replace(/\s*\(.*?\)\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (/supporting actor/i.test(category)) return "Supporting Actor";
  if (/supporting actress/i.test(category)) return "Supporting Actress";
  if (/actor/i.test(category)) return "Actor";
  if (/actress/i.test(category)) return "Actress";
  if (/original song|music.*song/i.test(category)) return "Original Song";
  if (/score|music/i.test(category)) return "Music";
  if (/director/i.test(category)) return "Director";
  if (/screenplay|writing/i.test(category)) return "Screenplay";
  if (/documentary.*short/i.test(category)) return "Documentary Short";
  if (/short/i.test(category)) return "Short Film";
  if (/documentary/i.test(category)) return "Documentary";
  if (/foreign|international/i.test(category)) return "International Film";
  if (/picture|film/i.test(category)) return "Picture";

  return normalized || category;
}

function getAwardStatus(wins: number, awardCount: number): string {
  if (wins === 0) return "Nominated";
  if (wins === awardCount) return "Won";
  return "Won / Nominated";
}

function getDecade(year: number): string {
  return `${Math.floor(year / 10) * 10}s`;
}

function formatGenres(genres: string[]): string {
  if (genres.length === 0) return "Unknown";
  return genres.slice(0, 2).join(" / ");
}

function formatYearTrail(years: number[]): string {
  const uniqueYears = Array.from(new Set(years)).sort((a, b) => a - b);
  if (uniqueYears.length === 0) return "No year";
  if (uniqueYears.length === 1) return String(uniqueYears[0]);
  return `${uniqueYears[0]}-${uniqueYears[uniqueYears.length - 1]}`;
}
