-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- Required by the trigram GIN indexes (gin_trgm_ops) on Film.title / Film.director / Person.name.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('roll', 'roll_personalized', 'impression', 'film_click', 'watchlist_add', 'watchlist_remove', 'watched', 'not_interested', 'rating_set', 'sentiment_set', 'recommendation_served', 'recommendation_click', 'search', 'filter_apply', 'pick_of_day_click');

-- CreateEnum
CREATE TYPE "WatchedSentiment" AS ENUM ('like', 'dislike');

-- CreateTable
CREATE TABLE "Film" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "tmdbId" INTEGER,
    "imdbId" TEXT,
    "title" TEXT NOT NULL,
    "originalTitle" TEXT,
    "year" INTEGER NOT NULL,
    "runtime" INTEGER,
    "genres" TEXT[],
    "contentType" TEXT NOT NULL DEFAULT 'movie',
    "plot" TEXT,
    "director" TEXT,
    "cast" JSONB NOT NULL DEFAULT '[]',
    "language" TEXT,
    "posterUrl" TEXT,
    "posterColor" TEXT,
    "backdropUrl" TEXT,
    "trailerUrl" TEXT,
    "imdbRating" DOUBLE PRECISION,
    "rtScore" INTEGER,
    "imdbTopMovieRank" INTEGER,
    "imdbTopTvRank" INTEGER,
    "certificate" TEXT,
    "tvType" TEXT,
    "tvStartYear" INTEGER,
    "tvEndYear" INTEGER,
    "oscarNominations" INTEGER NOT NULL DEFAULT 0,
    "oscarWins" INTEGER NOT NULL DEFAULT 0,
    "oscarCategories" JSONB NOT NULL DEFAULT '[]',
    "ggNominations" INTEGER NOT NULL DEFAULT 0,
    "ggWins" INTEGER NOT NULL DEFAULT 0,
    "ggCategories" JSONB NOT NULL DEFAULT '[]',
    "cannesNominations" INTEGER NOT NULL DEFAULT 0,
    "cannesWins" INTEGER NOT NULL DEFAULT 0,
    "cannesCategories" JSONB NOT NULL DEFAULT '[]',
    "berlinNominations" INTEGER NOT NULL DEFAULT 0,
    "berlinWins" INTEGER NOT NULL DEFAULT 0,
    "berlinCategories" JSONB NOT NULL DEFAULT '[]',
    "watchProviders" JSONB,
    "isPickOfDay" BOOLEAN NOT NULL DEFAULT false,
    "pickOfDayDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Film_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Person" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tmdbPersonId" INTEGER,
    "role" TEXT NOT NULL DEFAULT 'nominee',
    "photoUrl" TEXT,
    "bio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RollEvent" (
    "id" TEXT NOT NULL,
    "filmId" TEXT NOT NULL,
    "rolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RollEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "emailVerified" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "onboardingGenres" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "anonId" TEXT,
    "sessionId" TEXT NOT NULL,
    "type" "EventType" NOT NULL,
    "filmId" TEXT,
    "context" JSONB NOT NULL,
    "variant" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Watchlist" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "filmId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Watchlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WatchedFilm" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "filmId" TEXT NOT NULL,
    "watchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "doNotSuggest" BOOLEAN NOT NULL DEFAULT false,
    "sentiment" "WatchedSentiment",

    CONSTRAINT "WatchedFilm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PickOfDayHistory" (
    "id" TEXT NOT NULL,
    "filmId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PickOfDayHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserTasteProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "genreWeights" JSONB NOT NULL DEFAULT '{}',
    "directorWeights" JSONB NOT NULL DEFAULT '{}',
    "decadeWeights" JSONB NOT NULL DEFAULT '{}',
    "runtimeBandWeights" JSONB NOT NULL DEFAULT '{}',
    "awardAffinity" JSONB NOT NULL DEFAULT '{}',
    "ratingTier" JSONB NOT NULL DEFAULT '{}',
    "positiveCount" INTEGER NOT NULL DEFAULT 0,
    "negativeCount" INTEGER NOT NULL DEFAULT 0,
    "staleAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserTasteProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Film_slug_key" ON "Film"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Film_tmdbId_key" ON "Film"("tmdbId");

-- CreateIndex
CREATE UNIQUE INDEX "Film_imdbId_key" ON "Film"("imdbId");

-- CreateIndex
CREATE INDEX "Film_title_idx" ON "Film"("title");

-- CreateIndex
CREATE INDEX "Film_year_idx" ON "Film"("year");

-- CreateIndex
CREATE INDEX "Film_genres_gin_idx" ON "Film" USING GIN ("genres");

-- CreateIndex
CREATE INDEX "Film_title_trgm_idx" ON "Film" USING GIN ("title" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "Film_imdbRating_idx" ON "Film"("imdbRating");

-- CreateIndex
CREATE INDEX "Film_rtScore_idx" ON "Film"("rtScore");

-- CreateIndex
CREATE INDEX "Film_contentType_idx" ON "Film"("contentType");

-- CreateIndex
CREATE INDEX "Film_language_idx" ON "Film"("language");

-- CreateIndex
CREATE INDEX "Film_director_trgm_idx" ON "Film" USING GIN ("director" gin_trgm_ops);

-- CreateIndex
CREATE UNIQUE INDEX "Person_slug_key" ON "Person"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Person_tmdbPersonId_key" ON "Person"("tmdbPersonId");

-- CreateIndex
CREATE INDEX "Person_name_idx" ON "Person"("name");

-- CreateIndex
CREATE INDEX "Person_name_trgm_idx" ON "Person" USING GIN ("name" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "RollEvent_filmId_rolledAt_idx" ON "RollEvent"("filmId", "rolledAt");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "Event_userId_type_createdAt_idx" ON "Event"("userId", "type", "createdAt");

-- CreateIndex
CREATE INDEX "Event_anonId_createdAt_idx" ON "Event"("anonId", "createdAt");

-- CreateIndex
CREATE INDEX "Event_filmId_type_idx" ON "Event"("filmId", "type");

-- CreateIndex
CREATE INDEX "Event_type_createdAt_idx" ON "Event"("type", "createdAt");

-- CreateIndex
CREATE INDEX "Event_sessionId_idx" ON "Event"("sessionId");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "Watchlist_userId_idx" ON "Watchlist"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Watchlist_userId_filmId_key" ON "Watchlist"("userId", "filmId");

-- CreateIndex
CREATE INDEX "WatchedFilm_userId_idx" ON "WatchedFilm"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WatchedFilm_userId_filmId_key" ON "WatchedFilm"("userId", "filmId");

-- CreateIndex
CREATE UNIQUE INDEX "PickOfDayHistory_date_key" ON "PickOfDayHistory"("date");

-- CreateIndex
CREATE INDEX "PickOfDayHistory_filmId_idx" ON "PickOfDayHistory"("filmId");

-- CreateIndex
CREATE UNIQUE INDEX "UserTasteProfile_userId_key" ON "UserTasteProfile"("userId");

-- CreateIndex
CREATE INDEX "UserTasteProfile_staleAt_idx" ON "UserTasteProfile"("staleAt");

-- AddForeignKey
ALTER TABLE "RollEvent" ADD CONSTRAINT "RollEvent_filmId_fkey" FOREIGN KEY ("filmId") REFERENCES "Film"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_filmId_fkey" FOREIGN KEY ("filmId") REFERENCES "Film"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Watchlist" ADD CONSTRAINT "Watchlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Watchlist" ADD CONSTRAINT "Watchlist_filmId_fkey" FOREIGN KEY ("filmId") REFERENCES "Film"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchedFilm" ADD CONSTRAINT "WatchedFilm_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchedFilm" ADD CONSTRAINT "WatchedFilm_filmId_fkey" FOREIGN KEY ("filmId") REFERENCES "Film"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PickOfDayHistory" ADD CONSTRAINT "PickOfDayHistory_filmId_fkey" FOREIGN KEY ("filmId") REFERENCES "Film"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTasteProfile" ADD CONSTRAINT "UserTasteProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

