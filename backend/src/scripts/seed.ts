import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const adapter = new PrismaPg({ connectionString: process.env["DATABASE_URL"] });
const prisma = new PrismaClient({ adapter, log: ["warn", "error"] });

async function main() {
  const filePath = path.join(__dirname, "../../data/films-final.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  const films: Record<string, unknown>[] = JSON.parse(raw);

  console.log(`Seeding ${films.length} films...`);

  let upserted = 0;
  for (const film of films) {
    await prisma.film.upsert({
      where: { slug: film.slug as string },
      update: {
        tmdbId: film.tmdbId as number | null,
        imdbId: film.imdbId as string | null,
        title: film.title as string,
        year: film.year as number,
        runtime: film.runtime as number | null,
        genres: film.genres as string[],
        plot: film.plot as string | null,
        director: film.director as string | null,
        cast: film.cast as object,
        language: film.language as string | null,
        posterUrl: film.posterUrl as string | null,
        backdropUrl: film.backdropUrl as string | null,
        trailerUrl: film.trailerUrl as string | null,
        imdbRating: film.imdbRating as number | null,
        rtScore: film.rtScore as number | null,
        oscarNominations: film.oscarNominations as number,
        oscarWins: film.oscarWins as number,
        oscarCategories: film.oscarCategories as object,
        ggNominations: film.ggNominations as number,
        ggWins: film.ggWins as number,
        ggCategories: film.ggCategories as object,
        isPickOfDay: film.isPickOfDay as boolean,
        pickOfDayDate:
          film.pickOfDayDate != null
            ? new Date(film.pickOfDayDate as string)
            : null,
      },
      create: {
        slug: film.slug as string,
        tmdbId: film.tmdbId as number | null,
        imdbId: film.imdbId as string | null,
        title: film.title as string,
        year: film.year as number,
        runtime: film.runtime as number | null,
        genres: film.genres as string[],
        plot: film.plot as string | null,
        director: film.director as string | null,
        cast: film.cast as object,
        language: film.language as string | null,
        posterUrl: film.posterUrl as string | null,
        backdropUrl: film.backdropUrl as string | null,
        trailerUrl: film.trailerUrl as string | null,
        imdbRating: film.imdbRating as number | null,
        rtScore: film.rtScore as number | null,
        oscarNominations: film.oscarNominations as number,
        oscarWins: film.oscarWins as number,
        oscarCategories: film.oscarCategories as object,
        ggNominations: film.ggNominations as number,
        ggWins: film.ggWins as number,
        ggCategories: film.ggCategories as object,
        isPickOfDay: film.isPickOfDay as boolean,
        pickOfDayDate:
          film.pickOfDayDate != null
            ? new Date(film.pickOfDayDate as string)
            : null,
      },
    });
    upserted++;
    if (upserted % 10 === 0) {
      console.log(`  ${upserted}/${films.length}`);
    }
  }

  console.log(`Done. ${upserted} films seeded.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
