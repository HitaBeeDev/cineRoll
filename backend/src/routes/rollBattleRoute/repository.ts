import { prisma } from "../../lib/prisma";
import { LEADERBOARD_MIN_GAMES } from "./constants";
import { eloUpdate, INITIAL_RATING } from "./elo";
import { MatchResult } from "./schemas";

type RatingState = { rating: number; games: number; wins: number };

export type LeaderboardFilm = {
  id: string;
  slug: string;
  title: string;
  releaseYear: number;
  posterUrl: string | null;
  rating: number;
  games: number;
  wins: number;
};

// Apply a batch of pairwise outcomes to the Elo table in one transaction.
//
// Rounds are applied sequentially against an in-memory snapshot so a film that
// recurs across rounds (the king-of-the-hill champion) compounds correctly,
// then each touched film is persisted once. Unknown film ids are dropped up
// front so a single bad id can't fail the whole submission.
export async function applyBattleResults(
  results: MatchResult[],
  userId: string | undefined,
): Promise<number> {
  const valid = await validResults(results);
  if (valid.length === 0) return 0;

  await prisma.$transaction(async tx => {
    const ids = [...new Set(valid.flatMap(result => [result.winnerId, result.loserId]))];
    const existing = await tx.filmRating.findMany({ where: { filmId: { in: ids } } });
    const state = new Map<string, RatingState>(
      existing.map(row => [row.filmId, { rating: row.rating, games: row.games, wins: row.wins }]),
    );
    const stateFor = (id: string): RatingState =>
      state.get(id) ?? { rating: INITIAL_RATING, games: 0, wins: 0 };

    for (const { winnerId, loserId } of valid) {
      const winner = stateFor(winnerId);
      const loser = stateFor(loserId);
      const { winnerDelta, loserDelta } = eloUpdate(
        winner.rating,
        winner.games,
        loser.rating,
        loser.games,
      );

      state.set(winnerId, {
        rating: winner.rating + winnerDelta,
        games: winner.games + 1,
        wins: winner.wins + 1,
      });
      state.set(loserId, {
        rating: loser.rating + loserDelta,
        games: loser.games + 1,
        wins: loser.wins,
      });
    }

    for (const [filmId, next] of state) {
      await tx.filmRating.upsert({
        where: { filmId },
        create: { filmId, rating: next.rating, games: next.games, wins: next.wins },
        update: { rating: next.rating, games: next.games, wins: next.wins },
      });
    }

    await tx.battleMatch.createMany({
      data: valid.map(result => ({
        winnerId: result.winnerId,
        loserId: result.loserId,
        userId: userId ?? null,
      })),
    });
  });

  return valid.length;
}

// Keep only self-consistent matches whose two films both exist — protects the
// FK-constrained writes and ignores a degenerate film-vs-itself result.
async function validResults(results: MatchResult[]): Promise<MatchResult[]> {
  const distinct = results.filter(result => result.winnerId !== result.loserId);
  if (distinct.length === 0) return [];

  const ids = [...new Set(distinct.flatMap(result => [result.winnerId, result.loserId]))];
  const films = await prisma.film.findMany({ where: { id: { in: ids } }, select: { id: true } });
  const known = new Set(films.map(film => film.id));

  return distinct.filter(result => known.has(result.winnerId) && known.has(result.loserId));
}

export async function getLeaderboard(limit: number): Promise<LeaderboardFilm[]> {
  const rows = await prisma.filmRating.findMany({
    where: { games: { gte: LEADERBOARD_MIN_GAMES } },
    orderBy: [{ rating: "desc" }, { games: "desc" }],
    take: limit,
    select: {
      rating: true,
      games: true,
      wins: true,
      film: {
        select: { id: true, slug: true, title: true, releaseYear: true, posterUrl: true },
      },
    },
  });

  return rows.map(row => ({
    id: row.film.id,
    slug: row.film.slug,
    title: row.film.title,
    releaseYear: row.film.releaseYear,
    posterUrl: row.film.posterUrl,
    rating: Math.round(row.rating),
    games: row.games,
    wins: row.wins,
  }));
}
