-- AlterTable
ALTER TABLE "Film" ADD COLUMN     "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "moodTags" TEXT[] DEFAULT ARRAY[]::TEXT[];
