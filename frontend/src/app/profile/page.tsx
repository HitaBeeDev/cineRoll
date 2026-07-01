import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/auth";
import { apiFetch } from "@/lib/apiWithAuth";
import { AppHeader } from "@/components/app-header";
import {
  RecommendationsSection,
  type Recommendation,
} from "@/components/recommendations-section";

type ProfileSummary = {
  watchlist: number;
  watched: number;
  hidden: number;
  rated: number;
  favoriteGenres: string[];
  genresFromRatings: boolean;
};

const EMPTY_SUMMARY: ProfileSummary = {
  watchlist: 0,
  watched: 0,
  hidden: 0,
  rated: 0,
  favoriteGenres: [],
  genresFromRatings: false,
};

async function fetchSummary(): Promise<ProfileSummary> {
  const res = await apiFetch("/api/user/summary");
  if (!res.ok) return EMPTY_SUMMARY;
  const data = (await res.json().catch(() => ({}))) as Partial<ProfileSummary>;
  return {
    watchlist: data.watchlist ?? 0,
    watched: data.watched ?? 0,
    hidden: data.hidden ?? 0,
    rated: data.rated ?? 0,
    favoriteGenres: data.favoriteGenres ?? [],
    genresFromRatings: data.genresFromRatings ?? false,
  };
}

type RecommendationsResponse =
  | { code: "NOT_ENOUGH_DATA" }
  | { coldStart: boolean; recommendations: Recommendation[] };

async function fetchRecommendations(): Promise<{
  recommendations: Recommendation[];
  coldStart: boolean;
  notEnoughData: boolean;
}> {
  const res = await apiFetch("/api/recommendations?limit=8");
  if (!res.ok) return { recommendations: [], coldStart: false, notEnoughData: false };
  const data = (await res.json().catch(() => ({}))) as RecommendationsResponse;
  if ("code" in data) {
    return { recommendations: [], coldStart: false, notEnoughData: data.code === "NOT_ENOUGH_DATA" };
  }
  return { recommendations: data.recommendations, coldStart: data.coldStart, notEnoughData: false };
}

export const metadata: Metadata = {
  title: "Your Profile | CineRoll",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function initialsFrom(name?: string | null, email?: string | null): string {
  const source = (name ?? email ?? "").trim();
  if (!source) return "?";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

type SectionDef = {
  href: string;
  title: string;
  blurb: string;
  // The specific action this card performs — kept distinct per card so no two
  // read the same, and always naming the destination.
  action: string;
};

const SECTIONS: readonly SectionDef[] = [
  {
    href: "watchlist",
    title: "Watchlist",
    blurb: "Films you’ve saved to watch later.",
    action: "Open watchlist",
  },
  {
    href: "history",
    title: "Watch History",
    blurb: "Everything you’ve marked watched, with your ratings.",
    action: "View history",
  },
  {
    href: "settings",
    title: "Settings",
    blurb: "Your account and preferences.",
    action: "Edit preferences",
  },
] as const;

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex h-8 items-end">
        <span className="font-[family-name:var(--font-display)] text-2xl font-bold leading-none text-[#F5F5F0]">
          {value}
        </span>
      </div>
      <p className="mt-1.5 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.18em] text-[#9a9aac]">
        {label}
      </p>
    </div>
  );
}

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect(`/auth/signin`);

  const { name, email } = session.user;
  // Kick off both fetches in parallel, but only block the shell on the fast
  // summary. Recommendations run a ~1s recommender query (remote DB, 300-film
  // candidate scan), so they stream in behind a skeleton via Suspense instead
  // of holding the whole page blank until they resolve.
  const recsPromise = fetchRecommendations();
  const summary = await fetchSummary();

  // A profile with no saved, watched, or hidden films hasn't touched the core
  // loop yet — lead with onboarding instead of a wall of empty destinations.
  const isNewUser =
    summary.watchlist === 0 && summary.watched === 0 && summary.hidden === 0;

  return (
    <main className="flex flex-1 flex-col bg-[#07070b] text-[#f4f4f5]">
      <AppHeader />
      <div className="mx-auto max-w-5xl px-6 py-16 lg:px-10">
        <div className="flex items-center gap-5">
          {/* Calm avatar: a dark disc with a thin red accent ring, so red stays
              reserved for primary actions rather than a large filled circle. */}
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[#e8453c]/35 bg-[#12121c] font-[family-name:var(--font-geist-mono)] text-base font-bold tracking-wide text-[#e9e9ee]">
            {initialsFrom(name, email)}
          </div>
          <div className="min-w-0">
            <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#F5F5F0]">
              {name ?? "Your Profile"}
            </h1>
            {email && (
              <p className="mt-1 truncate font-[family-name:var(--font-geist-mono)] text-[12px] normal-case tracking-[0.06em] text-[#9a9aac]">
                {email}
              </p>
            )}
          </div>
        </div>

        {/* Dashboard footing: the three activity counts read as one consistent
            quantitative row. Genres are a preference, not a count, so they live
            below as tags — never dressed up as a stat next to the zeros. */}
        <div className="mt-8 border-t border-[#1e1e2a] pt-7">
          <div className="flex flex-wrap gap-x-12 gap-y-5">
            <Stat label="Films rated" value={summary.rated} />
            <Stat label="Watchlist" value={summary.watchlist} />
            <Stat label="Watched" value={summary.watched} />
          </div>

          {summary.rated === 0 &&
            summary.watchlist === 0 &&
            summary.watched === 0 && (
              <p className="mt-5 font-[family-name:var(--font-geist-mono)] text-[11px] leading-relaxed text-[#9a9aac]">
                Your stats fill in as you go — roll films to rate them, save some
                to your watchlist, and mark what you’ve watched.
              </p>
            )}

          {/* Only surface genres once they reflect real rating behavior — a
              brand-new profile shows just the three activity counts, so an
              onboarding preference never looks like a stat next to the zeros. */}
          {summary.genresFromRatings && summary.favoriteGenres.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.18em] text-[#9a9aac]">
                Favorite genres
              </span>
              <span className="flex flex-wrap gap-2">
                {summary.favoriteGenres.map((genre) => (
                  <span
                    key={genre}
                    className="rounded-full border border-[#26263a] bg-[#0d0d1a] px-3 py-1 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.12em] text-[#b9b9c6]"
                  >
                    {genre}
                  </span>
                ))}
              </span>
            </div>
          )}
        </div>

        {isNewUser && (
          <div className="mt-10 flex flex-col gap-6 rounded-xl border border-[#e8453c]/30 bg-gradient-to-br from-[#1c0f0e] to-[#0d0d1a] px-7 py-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[#F5F5F0]">
                Roll your first film
              </h2>
              <p className="mt-2 font-[family-name:var(--font-geist-mono)] text-[12px] leading-relaxed text-[#9a9aac]">
                Your reel pool is ready — start with award-winning films from your
                selected genres. Rate a few and every roll sharpens what comes next.
              </p>
            </div>
            <Link
              href={`/`}
              className="inline-flex shrink-0 items-center gap-2 self-start rounded-xl bg-[#e8453c] px-6 py-3 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.2em] text-[#F5F5F0] transition-colors hover:bg-[#d5342b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c] sm:self-auto"
            >
              Roll your first film <span aria-hidden>→</span>
            </Link>
          </div>
        )}

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {SECTIONS.map((section) => (
            <Link
              key={section.href}
              href={`/profile/${section.href}`}
              className="group flex flex-col rounded-xl border border-[#1e1e2a] bg-[#0d0d1a] px-6 py-7 transition-colors hover:border-[#e8453c]/60 hover:bg-[#111120] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]"
            >
              <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-[#F5F5F0]">
                {section.title}
              </h2>
              <p className="mt-2 flex-1 font-[family-name:var(--font-geist-mono)] text-[11px] leading-relaxed text-[#9a9aac]">
                {section.blurb}
              </p>
              <div className="mt-5 flex items-center justify-between font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.15em] text-[#b9b9c6] transition-colors group-hover:text-[#e8453c]">
                <span>{section.action}</span>
                <span
                  aria-hidden
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                >
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>

        <Suspense fallback={<RecommendationsSkeleton />}>
          <ProfileRecommendations recsPromise={recsPromise} />
        </Suspense>
      </div>
    </main>
  );
}

/**
 * Streamed recommendations: awaits the slow recommender promise inside its own
 * Suspense boundary so the rest of the profile paints immediately. Renders the
 * grid, the not-enough-data prompt, or nothing.
 */
async function ProfileRecommendations({
  recsPromise,
}: {
  recsPromise: ReturnType<typeof fetchRecommendations>;
}) {
  const recs = await recsPromise;

  if (recs.recommendations.length > 0) {
    return (
      <RecommendationsSection
        recommendations={recs.recommendations}
        coldStart={recs.coldStart}
      />
    );
  }

  if (recs.notEnoughData) {
    return (
      <section className="mt-16">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[#F5F5F0]">
          Recommended for you
        </h2>
        <div className="mt-6 flex flex-col items-center gap-5 rounded-xl border border-dashed border-[#1e1e2a] bg-[#0d0d1a] px-6 py-16 text-center">
          <p className="max-w-sm font-[family-name:var(--font-geist-mono)] text-sm leading-relaxed text-[#9a9aac]">
            Roll and rate a few more films to unlock your picks
          </p>
          <Link
            href={`/`}
            className="inline-flex items-center rounded-xl bg-[#e8453c] px-6 py-3 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.2em] text-[#F5F5F0] transition-colors hover:bg-[#d5342b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]"
          >
            Roll a film
          </Link>
        </div>
      </section>
    );
  }

  return null;
}

/** Placeholder poster grid shown while recommendations stream in. */
function RecommendationsSkeleton() {
  return (
    <section className="mt-16">
      <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[#F5F5F0]">
        Recommended for you
      </h2>
      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col">
            <div className="aspect-[2/3] w-full animate-pulse rounded-lg bg-[#111120]" />
            <div className="mt-3 h-3 w-3/4 animate-pulse rounded bg-[#111120]" />
            <div className="mt-2 h-2.5 w-1/3 animate-pulse rounded bg-[#0f0f18]" />
          </div>
        ))}
      </div>
    </section>
  );
}
