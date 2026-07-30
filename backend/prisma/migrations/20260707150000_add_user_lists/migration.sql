-- CreateTable
CREATE TABLE "UserList" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserListEntry" (
    "id" TEXT NOT NULL,
    "listId" TEXT NOT NULL,
    "filmId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserListEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserList_userId_idx" ON "UserList"("userId");

-- CreateIndex
CREATE INDEX "UserListEntry_listId_idx" ON "UserListEntry"("listId");

-- CreateIndex
CREATE INDEX "UserListEntry_filmId_idx" ON "UserListEntry"("filmId");

-- CreateIndex
CREATE UNIQUE INDEX "UserListEntry_listId_filmId_key" ON "UserListEntry"("listId", "filmId");

-- AddForeignKey
ALTER TABLE "UserList" ADD CONSTRAINT "UserList_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserListEntry" ADD CONSTRAINT "UserListEntry_listId_fkey" FOREIGN KEY ("listId") REFERENCES "UserList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserListEntry" ADD CONSTRAINT "UserListEntry_filmId_fkey" FOREIGN KEY ("filmId") REFERENCES "Film"("id") ON DELETE CASCADE ON UPDATE CASCADE;
