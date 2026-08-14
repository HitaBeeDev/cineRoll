import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/auth";
import { AppHeader } from "@/components/app-header";
import { ProfileCollectionHeader } from "@/components/profile-collection/profile-collection-header";
import { NotificationsBody } from "@/features/notifications/components/notifications-body";
import { fetchNotificationsFeed } from "@/features/notifications/notifications-repository";

export const metadata: Metadata = {
  title: "What's New",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  const resultPromise = fetchNotificationsFeed();

  return (
    <main className="flex flex-1 flex-col bg-[#07070b] text-[#f4f4f5]">
      <AppHeader />
      <div className="mx-auto w-full max-w-2xl px-6 py-12 lg:px-10">
        <ProfileCollectionHeader title="What's New" />
        <p className="mt-3 text-[13px] leading-relaxed text-[#7c7890]">
          Films added to the catalogue, award data corrections, and site updates.
        </p>
        <div className="mt-8">
          <Suspense fallback={<NotificationsSkeleton />}>
            <NotificationsBody resultPromise={resultPromise} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}

function NotificationsSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#1a1a24] bg-[#0b0b13]">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="border-b border-[#16161f] px-5 py-4 last:border-b-0"
        >
          <div className="h-3 w-1/2 animate-pulse rounded bg-ink-750" />
          <div className="mt-3 h-3 w-3/4 animate-pulse rounded bg-[#111119]" />
        </div>
      ))}
    </div>
  );
}
