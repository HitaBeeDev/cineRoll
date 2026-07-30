-- CreateTable
CREATE TABLE "SiteFeedback" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SiteFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SiteFeedback_createdAt_idx" ON "SiteFeedback"("createdAt");
