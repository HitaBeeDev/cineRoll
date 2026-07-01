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

type ProfileSummary = { watchlist: number; watched: number; hidden: number };

async function fetchSummary(): Promise<ProfileSummary> {
  const res = await apiFetch("/api/user/summary");
  if (!res.ok) return { watchlist: 0, watched: 0, hidden: 0 };
  const data = (await res.json().catch(() => ({}))) as Partial<ProfileSummary>;
  return {
    watchlist: data.watchlist ?? 0,
    watched: data.watched ?? 0,
    hidden: data.hidden ?? 0,
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
  // Name of the summary metric this card counts, or null for a card (Settings)
  // that has no meaningful count.
  metric: keyof ProfileSummary | null;
  // Noun shown after the count, e.g. "3 films saved".
  countNoun: string;
};

const SECTIONS: readonly SectionDef[] = [
  {
    href: "watchlist",
    title: "View Watchlist",
    blurb: "Films you’ve saved to watch later.",
    metric: "watchlist",
    countNoun: "saved",
  },
  {
    href: "history",
    title: "Watched History",
    blurb: "Everything you’ve marked watched, with your ratings.",
    metric: "watched",
    countNoun: "watched",
  },
  {
    href: "settings",
    title: "Settings",
    blurb: "Your account and preferences.",
    metric: null,
    countNoun: "",
  },
] as const;

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
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#e8453c] font-[family-name:var(--font-geist-mono)] text-xl font-bold text-[#F5F5F0]">
            {initialsFrom(name, email)}
          </div>
          <div className="min-w-0">
            <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#F5F5F0]">
              {name ?? "Your Profile"}
            </h1>
            {email && (
              <p className="mt-1 truncate font-[family-name:var(--font-geist-mono)] text-[12px] normal-case tracking-[0.06em] text-[#888899]">
                {email}
              </p>
            )}
          </div>
        </div>

        {isNewUser && (
          <div className="mt-10 flex flex-col gap-6 rounded-xl border border-[#e8453c]/30 bg-gradient-to-br from-[#1c0f0e] to-[#0d0d1a] px-7 py-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[#F5F5F0]">
                Roll your first film
              </h2>
              <p className="mt-2 font-[family-name:var(--font-geist-mono)] text-[12px] leading-relaxed text-[#888899]">
                CineRoll spins award-winning films at you. Rate the ones you know
                and skip the rest — every roll sharpens what comes next.
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
          {SECTIONS.map((section) => {
            const count = section.metric ? summary[section.metric] : null;
            // A data section with nothing in it is a dead end, so route the card
            // to the roll instead and invite the user to fill it.
            const isEmptyData = count === 0;
            const href = isEmptyData ? `/` : `/profile/${section.href}`;

            return (
              <Link
                key={section.href}
                href={href}
                className="group flex flex-col rounded-xl border border-[#1e1e2a] bg-[#0d0d1a] px-6 py-7 transition-colors hover:border-[#e8453c]/60 hover:bg-[#111120] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]"
              >
                <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-[#F5F5F0]">
                  {section.title}
                </h2>
                <p className="mt-2 flex-1 font-[family-name:var(--font-geist-mono)] text-[11px] leading-relaxed text-[#888899]">
                  {section.blurb}
                </p>
                <div className="mt-5 flex items-center justify-between font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.15em]">
                  {isEmptyData ? (
                    <span className="font-bold text-[#e8453c]">Start rolling</span>
                  ) : count != null ? (
                    <span className="text-[#888899]">
                      <span className="font-bold text-[#F5F5F0]">{count}</span>{" "}
                      film{count === 1 ? "" : "s"} {section.countNoun}
                    </span>
                  ) : (
                    <span className="text-[#888899]">Open</span>
                  )}
                  <span
                    aria-hidden
                    className="text-[#7a7a8c] transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-[#e8453c]"
                  >
                    {isEmptyData ? "→" : "↗"}
                  </span>
                </div>
              </Link>
            );
          })}
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
