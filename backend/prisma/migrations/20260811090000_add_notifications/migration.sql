-- Site-wide announcements for the header bell. One row per event (not per user):
-- every signed-in account reads the same list, and "read" is the single
-- User.notificationsReadAt timestamp below.
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "href" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- Null means "never opened the panel". The unread floor then falls back to
-- User.createdAt, so a new account does not inherit the whole backlog.
ALTER TABLE "User" ADD COLUMN     "notificationsReadAt" TIMESTAMP(3);
