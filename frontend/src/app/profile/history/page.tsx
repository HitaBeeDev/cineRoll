import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/auth";
import { AppHeader } from "@/components/app-header";
import { ProfileCollectionHeader } from "@/components/profile-collection/profile-collection-header";
import { ProfileCollectionSkeleton } from "@/components/profile-collection/profile-collection-skeleton";
import { HistoryBody } from "@/features/watch-history/components/history-body";
import { fetchWatched } from "@/features/watch-history/watched-repository";

export const metadata: Metadata = {
  title: "Watch History",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  const resultPromise = fetchWatched();

  return (
    <main className="flex flex-1 flex-col bg-[#07070b] text-[#f4f4f5]">
      <AppHeader />
      <div className="mx-auto max-w-5xl px-6 py-12 lg:px-10">
        <ProfileCollectionHeader title="Watch History" />
        <Suspense fallback={<ProfileCollectionSkeleton />}>
          <HistoryBody resultPromise={resultPromise} />
        </Suspense>
      </div>
    </main>
  );
}
