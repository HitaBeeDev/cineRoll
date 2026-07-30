-- CreateTable
CREATE TABLE "RollLaneBandit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "posteriors" JSONB NOT NULL DEFAULT '{"safe":{"alpha":4,"beta":2},"gem":{"alpha":2,"beta":4},"wild":{"alpha":1,"beta":3}}',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RollLaneBandit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RollLaneBandit_userId_key" ON "RollLaneBandit"("userId");

-- AddForeignKey
ALTER TABLE "RollLaneBandit" ADD CONSTRAINT "RollLaneBandit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
