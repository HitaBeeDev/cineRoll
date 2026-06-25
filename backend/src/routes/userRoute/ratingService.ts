import { logEvent } from "../../lib/events";
import { HttpError } from "../../middleware/errorHandler";
import { assertFilmExists } from "./filmRepository";
import { deleteRating, findRating, upsertRating } from "./ratingRepository";
import { staleTasteProfile } from "./taste";

export async function setRating(userId: string, filmId: string, rating: number) {
  await assertFilmExists(filmId);

  const entry = await upsertRating(userId, filmId, rating);
  await logEvent({
    type: "rating_set",
    userId,
    filmId,
    context: { source: "user_route", rating },
  });
  await staleTasteProfile(userId);

  return entry;
}

export async function getRating(userId: string, filmId: string) {
  const entry = await findRating(userId, filmId);

  if (!entry) {
    throw new HttpError(404, "Rating not found", "RATING_NOT_FOUND");
  }

  return entry;
}

export async function removeRating(userId: string, filmId: string): Promise<void> {
  if (!(await deleteRating(userId, filmId))) {
    throw new HttpError(404, "Rating not found", "RATING_NOT_FOUND");
  }

  await staleTasteProfile(userId);
}
