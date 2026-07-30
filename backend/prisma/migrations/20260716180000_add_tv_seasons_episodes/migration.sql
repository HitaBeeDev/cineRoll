-- Series display data: season and total-episode counts (from TMDB, carried in
-- master.json since the TV build path; only now surfaced in the schema).
ALTER TABLE "Film" ADD COLUMN "tvSeasons" INTEGER;
ALTER TABLE "Film" ADD COLUMN "tvEpisodes" INTEGER;
