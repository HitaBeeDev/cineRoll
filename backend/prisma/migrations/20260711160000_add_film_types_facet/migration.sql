-- A film's type is a set, not one value: a 9-minute war documentary is documentary
-- AND short. `contentType` stays as-is (the tmdbId uniqueness key is scoped by it);
-- the browse facets read this column instead. Values are derived at seed time by
-- deriveFilmTypes(), so an empty array here just means "not seeded yet".
ALTER TABLE "Film" ADD COLUMN     "types" TEXT[];

CREATE INDEX "Film_types_gin_idx" ON "Film" USING GIN ("types");
