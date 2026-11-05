-- Person: verification status (verified pages go in the sitemap).
ALTER TABLE "Person" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'unverified';

-- One row per nomination, rebuilt by `npm run link-credits -- --apply` after every seed.
CREATE TABLE "Credit" (
    "id" TEXT NOT NULL,
    "filmId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "awardYear" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "won" BOOLEAN NOT NULL,
    "nominee" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Credit_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Credit_filmId_idx" ON "Credit"("filmId");
CREATE INDEX "Credit_body_awardYear_idx" ON "Credit"("body", "awardYear");
ALTER TABLE "Credit" ADD CONSTRAINT "Credit_filmId_fkey"
    FOREIGN KEY ("filmId") REFERENCES "Film"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "CreditPerson" (
    "creditId" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "matchedBy" TEXT NOT NULL,
    CONSTRAINT "CreditPerson_pkey" PRIMARY KEY ("creditId", "personId")
);
CREATE INDEX "CreditPerson_personId_idx" ON "CreditPerson"("personId");
ALTER TABLE "CreditPerson" ADD CONSTRAINT "CreditPerson_creditId_fkey"
    FOREIGN KEY ("creditId") REFERENCES "Credit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CreditPerson" ADD CONSTRAINT "CreditPerson_personId_fkey"
    FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "PersonAlias" (
    "slug" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    CONSTRAINT "PersonAlias_pkey" PRIMARY KEY ("slug")
);
ALTER TABLE "PersonAlias" ADD CONSTRAINT "PersonAlias_personId_fkey"
    FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "FilmDirector" (
    "filmId" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    CONSTRAINT "FilmDirector_pkey" PRIMARY KEY ("filmId", "personId")
);
CREATE INDEX "FilmDirector_personId_idx" ON "FilmDirector"("personId");
ALTER TABLE "FilmDirector" ADD CONSTRAINT "FilmDirector_filmId_fkey"
    FOREIGN KEY ("filmId") REFERENCES "Film"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FilmDirector" ADD CONSTRAINT "FilmDirector_personId_fkey"
    FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;
