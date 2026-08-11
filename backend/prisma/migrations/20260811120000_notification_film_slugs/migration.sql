-- Slugs, not film ids: seed-master deletes and re-creates every Film row, so ids
-- are regenerated on each seed and any stored id would dangle after the next run.
ALTER TABLE "Notification" ADD COLUMN     "filmSlugs" TEXT[] DEFAULT ARRAY[]::TEXT[];
