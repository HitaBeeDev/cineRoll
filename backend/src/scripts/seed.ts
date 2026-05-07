import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const adapter = new PrismaPg({ connectionString: process.env["DATABASE_URL"] });
const prisma = new PrismaClient({ adapter, log: ["warn", "error"] });

type FilmRecord = Record<string, unknown>;

function mergeFilms(primary: FilmRecord, secondary: FilmRecord): FilmRecord {
  const mergedOscarCategories = [
    ...((primary.oscarCategories as unknown[]) ?? []),
    ...((secondary.oscarCategories as unknown[]) ?? []),
  ];
  const mergedGgCategories = [
    ...((primary.ggCategories as unknown[]) ?? []),
    ...((secondary.ggCategories as unknown[]) ?? []),
  ];
  const mergedCannesCategories = [
    ...((primary.cannesCategories as unknown[]) ?? []),
    ...((secondary.cannesCategories as unknown[]) ?? []),
  ];
  return {
    ...primary,
    oscarNominations:
      ((primary.oscarNominations as number) ?? 0) +
      ((secondary.oscarNominations as number) ?? 0),
    oscarWins:
      ((primary.oscarWins as number) ?? 0) +
      ((secondary.oscarWins as number) ?? 0),
    oscarCategories: mergedOscarCategories,
    ggNominations:
      ((primary.ggNominations as number) ?? 0) +
      ((secondary.ggNominations as number) ?? 0),
    ggWins:
      ((primary.ggWins as number) ?? 0) +
      ((secondary.ggWins as number) ?? 0),
    ggCategories: mergedGgCategories,
    cannesNominations:
      ((primary.cannesNominations as number) ?? 0) +
      ((secondary.cannesNominations as number) ?? 0),
    cannesWins:
      ((primary.cannesWins as number) ?? 0) +
      ((secondary.cannesWins as number) ?? 0),
    cannesCategories: mergedCannesCategories,
  };
}

function deduplicateByTmdbId(films: FilmRecord[]): FilmRecord[] {
  const byTmdbId = new Map<number, FilmRecord>();
  const noId: FilmRecord[] = [];

  for (const film of films) {
    const id = film.tmdbId as number | null;
    if (id == null) {
      noId.push(film);
      continue;
    }
    const existing = byTmdbId.get(id);
    if (!existing) {
      byTmdbId.set(id, film);
    } else {
      // Keep the entry with more award data as primary; merge awards
      const existingAwards =
        ((existing.oscarNominations as number) ?? 0) +
        ((existing.ggNominations as number) ?? 0);
      const newAwards =
        ((film.oscarNominations as number) ?? 0) +
        ((film.ggNominations as number) ?? 0);
      const [primaryFilm, secondaryFilm] =
        newAwards >= existingAwards ? [film, existing] : [existing, film];
      byTmdbId.set(id, mergeFilms(primaryFilm, secondaryFilm));
    }
  }

  return [...byTmdbId.values(), ...noId];
}

async function main() {
  const filePath = path.join(__dirname, "../../data/films-final.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  const rawFilms: FilmRecord[] = JSON.parse(raw);
  const films = deduplicateByTmdbId(rawFilms);

  console.log(
    `Seeding ${films.length} films (deduped from ${rawFilms.length})...`
  );

  await prisma.film.deleteMany({});
  console.log("Cleared existing rows.");

  const nullIfEmpty = (v: unknown) =>
    v === "" || v === undefined ? null : (v as string | null);

  let upserted = 0;
  for (const film of films as FilmRecord[]) {
    await prisma.film.upsert({
      where: { slug: film.slug as string },
      update: {
        tmdbId: film.tmdbId as number | null,
        imdbId: nullIfEmpty(film.imdbId),
        title: film.title as string,
        originalTitle: film.originalTitle as string | null,
        releaseYear: (film.releaseYear ?? film.year) as number,
        runtime: film.runtime as number | null,
        genres: film.genres as string[],
        contentType: (film.contentType as string | undefined) ?? "movie",
        plot: film.plot as string | null,
        director: film.director as string | null,
        cast: film.cast as object,
        language: film.language as string | null,
        posterUrl: film.posterUrl as string | null,
        posterColor: (film.posterColor as string | null | undefined) ?? null,
        backdropUrl: film.backdropUrl as string | null,
        trailerUrl: film.trailerUrl as string | null,
        imdbRating: film.imdbRating as number | null,
        rtScore: film.rtScore as number | null,
        imdbTopMovieRank: (film.imdbTopMovieRank as number | null | undefined) ?? null,
        imdbTopTvRank: (film.imdbTopTvRank as number | null | undefined) ?? null,
        certificate: nullIfEmpty(film.certificate),
        tvType: nullIfEmpty(film.tvType),
        tvStartYear: (film.tvStartYear as number | null | undefined) ?? null,
        tvEndYear: (film.tvEndYear as number | null | undefined) ?? null,
        oscarNominations: film.oscarNominations as number,
        oscarWins: film.oscarWins as number,
        oscarCategories: film.oscarCategories as object,
        ggNominations: film.ggNominations as number,
        ggWins: film.ggWins as number,
        ggCategories: film.ggCategories as object,
        cannesNominations: (film.cannesNominations as number | undefined) ?? 0,
        cannesWins: (film.cannesWins as number | undefined) ?? 0,
        cannesCategories: (film.cannesCategories as object | undefined) ?? [],
        isPickOfDay: film.isPickOfDay as boolean,
        pickOfDayDate:
          film.pickOfDayDate != null
            ? new Date(film.pickOfDayDate as string)
            : null,
      },
      create: {
        slug: film.slug as string,
        tmdbId: film.tmdbId as number | null,
        imdbId: nullIfEmpty(film.imdbId),
        title: film.title as string,
        originalTitle: film.originalTitle as string | null,
        releaseYear: (film.releaseYear ?? film.year) as number,
        runtime: film.runtime as number | null,
        genres: film.genres as string[],
        contentType: (film.contentType as string | undefined) ?? "movie",
        plot: film.plot as string | null,
        director: film.director as string | null,
        cast: film.cast as object,
        language: film.language as string | null,
        posterUrl: film.posterUrl as string | null,
        posterColor: (film.posterColor as string | null | undefined) ?? null,
        backdropUrl: film.backdropUrl as string | null,
        trailerUrl: film.trailerUrl as string | null,
        imdbRating: film.imdbRating as number | null,
        rtScore: film.rtScore as number | null,
        imdbTopMovieRank: (film.imdbTopMovieRank as number | null | undefined) ?? null,
        imdbTopTvRank: (film.imdbTopTvRank as number | null | undefined) ?? null,
        certificate: nullIfEmpty(film.certificate),
        tvType: nullIfEmpty(film.tvType),
        tvStartYear: (film.tvStartYear as number | null | undefined) ?? null,
        tvEndYear: (film.tvEndYear as number | null | undefined) ?? null,
        oscarNominations: film.oscarNominations as number,
        oscarWins: film.oscarWins as number,
        oscarCategories: film.oscarCategories as object,
        ggNominations: film.ggNominations as number,
        ggWins: film.ggWins as number,
        ggCategories: film.ggCategories as object,
        cannesNominations: (film.cannesNominations as number | undefined) ?? 0,
        cannesWins: (film.cannesWins as number | undefined) ?? 0,
        cannesCategories: (film.cannesCategories as object | undefined) ?? [],
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
