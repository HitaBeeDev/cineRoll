/*
  Warnings:

  - A unique constraint covering the columns `[tmdbId,contentType]` on the table `Film` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Film_tmdbId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Film_tmdbId_contentType_key" ON "Film"("tmdbId", "contentType");
