import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/auth";
import { AppHeader } from "@/components/app-header";
import { HistoryBody } from "@/features/watch-history/components/history-body";
import { HistorySkeleton } from "@/features/watch-history/components/history-skeleton";
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
        <Link
          href="/profile"
          className="inline-flex items-center gap-1.5 rounded font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.18em] text-[#9a9aac] underline-offset-4 transition-colors hover:text-[#e8453c] hover:underline focus-visible:text-[#e8453c] focus-visible:underline focus-visible:outline-none"
        >
          <span aria-hidden>←</span> Back to profile
        </Link>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold text-[#F5F5F0]">
          Watch History
        </h1>
        <Suspense fallback={<HistorySkeleton />}>
          <HistoryBody resultPromise={resultPromise} />
        </Suspense>
      </div>
    </main>
  );
}
