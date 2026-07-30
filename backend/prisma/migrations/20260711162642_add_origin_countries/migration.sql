-- AlterTable
ALTER TABLE "Film" ADD COLUMN     "originCountries" TEXT[];

-- CreateIndex
CREATE INDEX "Film_originCountries_gin_idx" ON "Film" USING GIN ("originCountries");
