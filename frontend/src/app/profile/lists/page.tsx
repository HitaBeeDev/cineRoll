import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import type { UserListSummary } from "@cineroll/types";
import { auth } from "@/auth";
import { apiFetch } from "@/lib/apiWithAuth";
import { AppHeader } from "@/components/app-header";
import { RetryButton } from "@/components/retry-button";
import { ListsManager } from "@/components/lists-manager";

export const metadata: Metadata = {
  title: "Your Lists",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const DEFAULT_MAX_LISTS = 20;

type ListsResult =
  | { status: "ok"; lists: UserListSummary[]; maxLists: number }
  | { status: "error" };

async function fetchLists(): Promise<ListsResult> {
  const res = await apiFetch("/api/user/lists");
  if (!res.ok) return { status: "error" };
  const data = (await res.json().catch(() => null)) as {
    lists?: UserListSummary[];
    maxLists?: number;
  } | null;
  if (!data) return { status: "error" };
  return {
    status: "ok",
    lists: data.lists ?? [],
    maxLists: data.maxLists ?? DEFAULT_MAX_LISTS,
  };
}

export default async function ListsPage() {
  const session = await auth();
  if (!session?.user) redirect(`/auth/signin`);

  const resultPromise = fetchLists();

  return (
    <main className="flex flex-1 flex-col bg-[#07070b] text-[#f4f4f5]">
      <AppHeader />
      <div className="mx-auto w-full max-w-[1120px] px-6 py-12 lg:px-10">
        <Link
          href="/profile"
          className="inline-flex items-center gap-1.5 rounded font-[family-name:var(--font-geist-sans)] text-[13px] text-[#b4b4c4] underline-offset-4 transition-colors hover:text-[#e8453c] hover:underline focus-visible:text-[#e8453c] focus-visible:underline focus-visible:outline-none"
        >
          <span aria-hidden>←</span> Back to profile
        </Link>

        <Suspense fallback={<ListsSkeleton />}>
          <ListsBody resultPromise={resultPromise} />
        </Suspense>
      </div>
    </main>
  );
}

async function ListsBody({ resultPromise }: { resultPromise: Promise<ListsResult> }) {
  const result = await resultPromise;

  if (result.status === "error") {
    return (
      <div className="mt-10 flex flex-col items-center gap-5 rounded-2xl border border-[#e8453c]/25 bg-[#0d0d1a] px-6 py-20 text-center">
        <p className="max-w-sm font-[family-name:var(--font-geist-sans)] text-[15px] leading-relaxed text-[#c2c2ce]">
          We couldn’t load your lists. This is usually a hiccup on our end — check
          your connection and try again.
        </p>
        <RetryButton />
      </div>
    );
  }

  return <ListsManager initialLists={result.lists} maxLists={result.maxLists} />;
}

function ListsSkeleton() {
  return (
    <div className="mt-6">
      <div className="flex items-center justify-between gap-4">
        <div className="h-9 w-48 animate-pulse rounded-lg bg-[#14141c]" />
        <div className="h-11 w-32 animate-pulse rounded-xl bg-[#14141c]" />
      </div>
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-72 animate-pulse rounded-2xl border border-white/[0.06] bg-[#101019]" />
        ))}
      </div>
    </div>
  );
}
