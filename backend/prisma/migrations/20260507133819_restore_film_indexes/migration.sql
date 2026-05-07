-- CreateIndex
CREATE INDEX "Film_title_idx" ON "Film"("title");

-- CreateIndex
CREATE INDEX "Film_year_idx" ON "Film"("year");

-- CreateIndex
CREATE INDEX "Film_genres_gin_idx" ON "Film" USING GIN ("genres");

-- CreateIndex
CREATE INDEX "Film_title_trgm_idx" ON "Film" USING GIN ("title" gin_trgm_ops);
