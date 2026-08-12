/*
  Warnings:

  - You are about to drop the `BattleMatch` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FilmComment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FilmRating` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserRating` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BattleMatch" DROP CONSTRAINT "BattleMatch_loserId_fkey";

-- DropForeignKey
ALTER TABLE "BattleMatch" DROP CONSTRAINT "BattleMatch_winnerId_fkey";

-- DropForeignKey
ALTER TABLE "FilmComment" DROP CONSTRAINT "FilmComment_filmId_fkey";

-- DropForeignKey
ALTER TABLE "FilmComment" DROP CONSTRAINT "FilmComment_userId_fkey";

-- DropForeignKey
ALTER TABLE "FilmRating" DROP CONSTRAINT "FilmRating_filmId_fkey";

-- DropForeignKey
ALTER TABLE "UserRating" DROP CONSTRAINT "UserRating_filmId_fkey";

-- DropForeignKey
ALTER TABLE "UserRating" DROP CONSTRAINT "UserRating_userId_fkey";

-- DropTable
DROP TABLE "BattleMatch";

-- DropTable
DROP TABLE "FilmComment";

-- DropTable
DROP TABLE "FilmRating";

-- DropTable
DROP TABLE "UserRating";
