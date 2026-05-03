-- Enable trigram matching for typo-tolerant title search.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- B-tree indexes for exact/prefix title queries and decade/year filtering.
CREATE INDEX IF NOT EXISTS "Film_title_idx" ON "Film"("title");
CREATE INDEX IF NOT EXISTS "Film_year_idx" ON "Film"("year");

-- GIN indexes for array containment/overlap genre filters and fuzzy title search.
CREATE INDEX IF NOT EXISTS "Film_genres_gin_idx" ON "Film" USING GIN ("genres");
CREATE INDEX IF NOT EXISTS "Film_title_trgm_idx" ON "Film" USING GIN ("title" gin_trgm_ops);

-- Prisma already created this from `slug String @unique` in the init migration.
CREATE UNIQUE INDEX IF NOT EXISTS "Film_slug_key" ON "Film"("slug");
