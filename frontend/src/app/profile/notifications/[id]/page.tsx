import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { apiFetch } from "@/lib/apiWithAuth";
import { AppHeader } from "@/components/app-header";
import { NotificationFilmCard } from "@/features/notifications/components/notification-film-card";
import type { SavedFilm } from "@/types/saved-film";

export const metadata: Metadata = {
  title: "What's New",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type NotificationMeta = { id: string; title: string; body: string | null };

type GroupResult =
  | { status: "ok"; notification: NotificationMeta; films: SavedFilm[] }
  | { status: "not-found" }
  | { status: "error" };

async function fetchNotificationGroup(id: string): Promise<GroupResult> {
  const res = await apiFetch(
    `/api/user/notifications/${encodeURIComponent(id)}`,
  );
  if (res.status === 404) return { status: "not-found" };
  if (!res.ok) return { status: "error" };

  const data = (await res.json().catch(() => null)) as {
    notification?: NotificationMeta;
    films?: SavedFilm[];
  } | null;
  if (!data?.notification) return { status: "error" };

  return {
    status: "ok",
    notification: data.notification,
    films: data.films ?? [],
  };
}

export default async function NotificationGroupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const { id } = await params;
  const result = await fetchNotificationGroup(id);
  if (result.status === "not-found") notFound();

  return (
    <main className="flex flex-1 flex-col bg-[#07070b] text-[#f4f4f5]">
      <AppHeader />
      <div className="mx-auto w-full max-w-5xl px-6 py-12 lg:px-10">
        <Link
          href="/profile/notifications"
          className="inline-flex items-center gap-1.5 rounded font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.18em] text-[#9a9aac] underline-offset-4 transition-colors hover:text-[#e8453c] hover:underline focus-visible:text-[#e8453c] focus-visible:underline focus-visible:outline-none"
        >
          <span aria-hidden>←</span> What&apos;s new
        </Link>

        {result.status === "error" ? (
          <p className="mt-10 rounded-xl border border-[#e8453c]/25 bg-[#0d0d1a] px-6 py-16 text-center font-[family-name:var(--font-geist-mono)] text-sm text-[#9a9aac]">
            We couldn&apos;t load these films. Please try again.
          </p>
        ) : (
          <>
            <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold text-[#F5F5F0]">
              {result.notification.title}
            </h1>
            <p className="mt-2 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.2em] text-[#9a9aac]">
              {result.films.length}{" "}
              {result.films.length === 1 ? "film" : "films"}
            </p>

            <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {result.films.map((film) => (
                <NotificationFilmCard key={film.id} film={film} />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
