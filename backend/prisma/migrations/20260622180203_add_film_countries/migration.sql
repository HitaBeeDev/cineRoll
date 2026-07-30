-- AlterTable
ALTER TABLE "Film" ADD COLUMN     "countries" TEXT[];

-- CreateIndex
CREATE INDEX "Film_countries_gin_idx" ON "Film" USING GIN ("countries");
