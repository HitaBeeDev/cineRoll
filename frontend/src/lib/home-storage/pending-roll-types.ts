import type { BanditLane, RollFilm } from "@/lib/api";

/**
 * The draw on screen, waiting to be graded.
 *
 * A roll is only scored when the *next* one is asked for: that is the moment we
 * know whether the user acted on it, pushed it away, or just rolled past. So the
 * draw has to outlive the component that showed it — it is written here when it
 * lands, marked in place as the user reacts, and spent by the following roll.
 *
 * Session storage, not a ref, because the session is not one page. Roll on the
 * home page, walk to browse, roll again: with a ref the first draw's penalty,
 * its bandit reward and its place in the chain all evaporated on the way over.
 *
 * Only the fields the grading reads are kept — the genre and type the penalty
 * lands on, the lane the reward credits, the id the chain points back at.
 */
export type PendingRoll = {
  film: Pick<RollFilm, "id" | "genres" | "contentType">;
  lane?: BanditLane | undefined;
  /** The server's id for this draw. Null when the log write failed. */
  drawId?: string | null | undefined;
  /** Position in the session, counting from 0. */
  index: number;
  engaged: boolean;
  rejected: boolean;
};
