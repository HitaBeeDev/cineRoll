import { HttpError } from "../../middleware/errorHandler";
import {
  COMMENTS_PAGE_SIZE,
  createComment,
  deleteOwnComment,
  findFilmIdBySlug,
  getComments,
  hasWatchedFilm,
} from "./commentRepository";

export async function listFilmComments(slug: string, page: number, userId?: string) {
  const filmId = await requireFilmId(slug);
  const { comments, total } = await getComments(filmId, page);

  return {
    comments: comments.map(({ userId: commentUserId, ...comment }) => ({
      ...comment,
      canDelete: userId === commentUserId,
    })),
    page,
    pageSize: COMMENTS_PAGE_SIZE,
    total,
    totalPages: Math.ceil(total / COMMENTS_PAGE_SIZE),
  };
}

export async function addFilmComment(userId: string, slug: string, body: string) {
  const filmId = await requireFilmId(slug);

  if (!(await hasWatchedFilm(userId, filmId))) {
    throw new HttpError(403, "Only users who watched this film can comment", "FILM_NOT_WATCHED");
  }

  const { userId: _commentUserId, ...payload } = await createComment(userId, filmId, body);
  return { ...payload, canDelete: true };
}

export async function removeFilmComment(userId: string, id: string): Promise<void> {
  if (!(await deleteOwnComment(userId, id))) {
    throw new HttpError(404, "Comment not found", "COMMENT_NOT_FOUND");
  }
}

async function requireFilmId(slug: string): Promise<string> {
  const filmId = await findFilmIdBySlug(slug);

  if (!filmId) {
    throw new HttpError(404, "Film not found", "FILM_NOT_FOUND");
  }

  return filmId;
}
