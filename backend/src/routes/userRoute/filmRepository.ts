import { prisma } from "../../lib/prisma";
import { HttpError } from "../../middleware/errorHandler";

export async function assertFilmExists(filmId: string): Promise<void> {
  const film = await prisma.film.findUnique({
    where: { id: filmId },
    select: { id: true },
  });

  if (!film) {
    throw new HttpError(404, "Film not found", "FILM_NOT_FOUND");
  }
}
