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

const SECTIONS = [
  {
    href: "watchlist",
    title: "View Watchlist",
    blurb: "Films you’ve saved to watch later.",
  },
  {
    href: "history",
    title: "Watched History",
    blurb: "Everything you’ve marked watched, with your ratings.",
  },
  {
    href: "settings",
    title: "Settings",
    blurb: "Your account and preferences.",
  },
] as const;

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect(`/auth/signin`);

  const { name, email } = session.user;
  const [summary, recs] = await Promise.all([fetchSummary(), fetchRecommendations()]);

  const stats = [
    { label: "in watchlist", value: summary.watchlist },
    { label: "watched", value: summary.watched },
    { label: "hidden from rolls", value: summary.hidden },
  ];

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
              <p className="mt-1 truncate font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.2em] text-[#888899]">
                {email}
              </p>
            )}
          </div>
        </div>

        <p className="mt-6 font-[family-name:var(--font-geist-mono)] text-[12px] text-[#888899]">
          {stats.map((stat, i) => (
            <span key={stat.label}>
              {i > 0 && <span className="px-2 text-[#444458]">·</span>}
              <span className="font-bold text-[#F5F5F0]">{stat.value}</span> {stat.label}
            </span>
          ))}
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {SECTIONS.map((section) => (
            <Link
              key={section.href}
              href={`/profile/${section.href}`}
              className="group rounded-xl border border-[#1e1e2a] bg-[#0d0d1a] px-6 py-7 transition-colors hover:border-[#e8453c]/60 hover:bg-[#111120] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]"
            >
              <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-[#F5F5F0]">
                {section.title}
              </h2>
              <p className="mt-2 font-[family-name:var(--font-geist-mono)] text-[11px] leading-relaxed text-[#888899]">
                {section.blurb}
              </p>
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
                className="inline-flex items-center rounded-xl bg-[#e8453c] px-6 py-3 font-[family-name:var(--font-geist-mono)] text-[10px] font-bold uppercase tracking-[0.2em] text-[#F5F5F0] transition-colors hover:bg-[#d5342b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]"
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
