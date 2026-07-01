import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
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
};

const EMPTY_SUMMARY: ProfileSummary = {
  watchlist: 0,
  watched: 0,
  hidden: 0,
  rated: 0,
  favoriteGenres: [],
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
  const [summary, recs] = await Promise.all([fetchSummary(), fetchRecommendations()]);

  // A profile with no saved, watched, or hidden films hasn't touched the core
  // loop yet — lead with onboarding instead of a wall of empty destinations.
  const isNewUser =
    summary.watchlist === 0 && summary.watched === 0 && summary.hidden === 0;

  return (
    <main className="min-h-screen bg-[#07070b] text-[#f4f4f5]">
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

        {/* Compact stats row: gives the page a real dashboard footing and stays
            useful for new users, where favorite genres reads "not enough data
            yet" until real signals exist. */}
        <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-[#1e1e2a] pt-7 sm:flex sm:flex-wrap sm:items-start sm:gap-x-12">
          <Stat label="Films rated" value={summary.rated} />
          <Stat label="Watchlist" value={summary.watchlist} />
          <Stat label="Watched" value={summary.watched} />
          <div className="col-span-2 min-w-0 sm:col-auto">
            <div className="flex h-8 items-end">
              {summary.favoriteGenres.length > 0 ? (
                <span className="truncate font-[family-name:var(--font-display)] text-lg font-bold leading-none text-[#F5F5F0]">
                  {summary.favoriteGenres.join(" · ")}
                </span>
              ) : (
                <span className="font-[family-name:var(--font-geist-mono)] text-[12px] leading-none text-[#7a7a8c]">
                  Not enough data yet
                </span>
              )}
            </div>
            <p className="mt-1.5 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.18em] text-[#9a9aac]">
              Favorite genres
            </p>
          </div>
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

        {recs.recommendations.length > 0 ? (
          <RecommendationsSection
            recommendations={recs.recommendations}
            coldStart={recs.coldStart}
          />
        ) : recs.notEnoughData ? (
          <section className="mt-16">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[#F5F5F0]">
              Recommended for you
            </h2>
            <div className="mt-6 flex flex-col items-center gap-5 rounded-xl border border-dashed border-[#1e1e2a] bg-[#0d0d1a] px-6 py-16 text-center">
              <p className="max-w-sm font-[family-name:var(--font-geist-mono)] text-sm leading-relaxed text-[#888899]">
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
        ) : null}
      </div>
    </main>
  );
}
