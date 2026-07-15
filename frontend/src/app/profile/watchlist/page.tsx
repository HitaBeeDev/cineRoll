import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/auth";
import { AppHeader } from "@/components/app-header";
import { ProfileCollectionHeader } from "@/components/profile-collection/profile-collection-header";
import { ProfileCollectionSkeleton } from "@/components/profile-collection/profile-collection-skeleton";
import { WatchlistBody } from "@/features/watchlist/components/watchlist-body";
import { fetchWatchlist } from "@/features/watchlist/watchlist-repository";

export const metadata: Metadata = {
  title: "Your Watchlist",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function WatchlistPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  const resultPromise = fetchWatchlist();

  return (
    <main className="flex flex-1 flex-col bg-[#07070b] text-[#f4f4f5]">
      <AppHeader />
      <div className="mx-auto max-w-5xl px-6 py-12 lg:px-10">
        <ProfileCollectionHeader title="Your Watchlist" />
        <Suspense fallback={<ProfileCollectionSkeleton />}>
          <WatchlistBody resultPromise={resultPromise} />
        </Suspense>
      </div>
    </main>
  );
}
