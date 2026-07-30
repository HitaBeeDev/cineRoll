-- CreateTable
CREATE TABLE "FilmComment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "filmId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FilmComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FilmComment_filmId_hidden_createdAt_idx" ON "FilmComment"("filmId", "hidden", "createdAt");

-- CreateIndex
CREATE INDEX "FilmComment_userId_idx" ON "FilmComment"("userId");

-- AddForeignKey
ALTER TABLE "FilmComment" ADD CONSTRAINT "FilmComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FilmComment" ADD CONSTRAINT "FilmComment_filmId_fkey" FOREIGN KEY ("filmId") REFERENCES "Film"("id") ON DELETE CASCADE ON UPDATE CASCADE;
