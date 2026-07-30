-- CreateTable
CREATE TABLE "FilmRating" (
    "id" TEXT NOT NULL,
    "filmId" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 1500,
    "games" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FilmRating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BattleMatch" (
    "id" TEXT NOT NULL,
    "winnerId" TEXT NOT NULL,
    "loserId" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BattleMatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FilmRating_filmId_key" ON "FilmRating"("filmId");

-- CreateIndex
CREATE INDEX "FilmRating_rating_idx" ON "FilmRating"("rating");

-- CreateIndex
CREATE INDEX "BattleMatch_createdAt_idx" ON "BattleMatch"("createdAt");

-- AddForeignKey
ALTER TABLE "FilmRating" ADD CONSTRAINT "FilmRating_filmId_fkey" FOREIGN KEY ("filmId") REFERENCES "Film"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BattleMatch" ADD CONSTRAINT "BattleMatch_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "Film"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BattleMatch" ADD CONSTRAINT "BattleMatch_loserId_fkey" FOREIGN KEY ("loserId") REFERENCES "Film"("id") ON DELETE CASCADE ON UPDATE CASCADE;
