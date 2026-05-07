-- AlterTable: add IMDB Top 250 fields to Film
ALTER TABLE "Film"
  ADD COLUMN "imdbTopMovieRank" INTEGER,
  ADD COLUMN "imdbTopTvRank"    INTEGER,
  ADD COLUMN "certificate"      TEXT,
  ADD COLUMN "tvType"           TEXT,
  ADD COLUMN "tvStartYear"      INTEGER,
  ADD COLUMN "tvEndYear"        INTEGER;
