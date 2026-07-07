import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { apiFetch } from "@/lib/apiWithAuth";
import { AppHeader } from "@/components/app-header";
import { ListDetailGrid, type ListEntry } from "@/components/list-detail-grid";

export const metadata: Metadata = {
  title: "List",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type ListMeta = { id: string; name: string; filmCount: number };

type ListResult =
  | { status: "ok"; list: ListMeta; films: ListEntry[]; nextCursor: string | null }
  | { status: "not-found" }
  | { status: "error" };

async function fetchList(listId: string): Promise<ListResult> {
  const res = await apiFetch(`/api/user/lists/${encodeURIComponent(listId)}`);
  if (res.status === 404) return { status: "not-found" };
  if (!res.ok) return { status: "error" };

  const data = (await res.json().catch(() => null)) as {
    list?: ListMeta;
    films?: ListEntry[];
    nextCursor?: string | null;
  } | null;
  if (!data?.list) return { status: "error" };

  return {
    status: "ok",
    list: data.list,
    films: data.films ?? [],
    nextCursor: data.nextCursor ?? null,
  };
}

export default async function ListDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect(`/auth/signin`);

  const { id } = await params;
  const result = await fetchList(id);
  if (result.status === "not-found") notFound();

  return (
    <main className="flex flex-1 flex-col bg-[#07070b] text-[#f4f4f5]">
      <AppHeader />
      <div className="mx-auto w-full max-w-5xl px-6 py-12 lg:px-10">
        <Link
          href="/profile/lists"
          className="inline-flex items-center gap-1.5 rounded font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.18em] text-[#9a9aac] underline-offset-4 transition-colors hover:text-[#e8453c] hover:underline focus-visible:text-[#e8453c] focus-visible:underline focus-visible:outline-none"
        >
          <span aria-hidden>←</span> All lists
        </Link>

        {result.status === "error" ? (
          <p className="mt-10 rounded-xl border border-[#e8453c]/25 bg-[#0d0d1a] px-6 py-16 text-center font-[family-name:var(--font-geist-mono)] text-sm text-[#9a9aac]">
            We couldn’t load this list. Please try again.
          </p>
        ) : (
          <>
            <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold text-[#F5F5F0]">
              {result.list.name}
            </h1>
            <p className="mt-2 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.2em] text-[#9a9aac]">
              {result.list.filmCount} {result.list.filmCount === 1 ? "film" : "films"}
            </p>

            <div className="mt-8">
              {result.films.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-[#1e1e2a] bg-[#0d0d1a] px-6 py-16 text-center">
                  <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[#F5F5F0]">
                    This list is empty
                  </h2>
                  <p className="mx-auto max-w-md font-[family-name:var(--font-geist-mono)] text-[13px] leading-relaxed text-[#9a9aac]">
                    Add films to this list from any roll or film page using “Add to list”.
                  </p>
                  <Link
                    href="/browse"
                    className="mt-1 inline-flex items-center rounded font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.2em] text-[#9a9aac] underline-offset-4 transition-colors hover:text-[#e8453c] hover:underline"
                  >
                    Browse films
                  </Link>
                </div>
              ) : (
                <ListDetailGrid
                  listId={result.list.id}
                  entries={result.films}
                  initialNextCursor={result.nextCursor}
                />
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
