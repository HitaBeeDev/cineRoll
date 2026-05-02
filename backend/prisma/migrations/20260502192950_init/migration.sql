-- CreateTable
CREATE TABLE "Film" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "tmdbId" INTEGER,
    "imdbId" TEXT,
    "title" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "runtime" INTEGER,
    "genres" TEXT[],
    "plot" TEXT,
    "director" TEXT,
    "cast" JSONB NOT NULL DEFAULT '[]',
    "language" TEXT,
    "posterUrl" TEXT,
    "backdropUrl" TEXT,
    "trailerUrl" TEXT,
    "imdbRating" DOUBLE PRECISION,
    "rtScore" INTEGER,
    "oscarNominations" INTEGER NOT NULL DEFAULT 0,
    "oscarWins" INTEGER NOT NULL DEFAULT 0,
    "oscarCategories" JSONB NOT NULL DEFAULT '[]',
    "ggNominations" INTEGER NOT NULL DEFAULT 0,
    "ggWins" INTEGER NOT NULL DEFAULT 0,
    "ggCategories" JSONB NOT NULL DEFAULT '[]',
    "isPickOfDay" BOOLEAN NOT NULL DEFAULT false,
    "pickOfDayDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Film_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RollEvent" (
    "id" TEXT NOT NULL,
    "filmId" TEXT NOT NULL,
    "rolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RollEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Film_slug_key" ON "Film"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Film_tmdbId_key" ON "Film"("tmdbId");

-- CreateIndex
CREATE UNIQUE INDEX "Film_imdbId_key" ON "Film"("imdbId");

-- CreateIndex
CREATE INDEX "RollEvent_filmId_rolledAt_idx" ON "RollEvent"("filmId", "rolledAt");

-- AddForeignKey
ALTER TABLE "RollEvent" ADD CONSTRAINT "RollEvent_filmId_fkey" FOREIGN KEY ("filmId") REFERENCES "Film"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
