import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { AppHeader } from "@/components/app-header";
import { Trophy, Star, Film, Calendar, TrendingUp, Award } from "lucide-react";

export const metadata: Metadata = {
  title: "Award Film Stats & Records | CineRoll",
  description:
    "Discover the most nominated and award-winning films and people across the Oscars, Golden Globes, and Cannes. Explore decade-by-decade breakdowns and CineRoll trending data.",
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type PersonStat = { name: string; count: number };
type FilmStat = {
  id: string;
  slug: string;
  title: string;
  releaseYear: number;
  posterUrl: string | null;
  count: number;
};
type StatsResponse = {
  summary: { totalFilms: number; totalNominations: number; totalWins: number };
  mostNominatedPerson: PersonStat | null;
  mostWinningPerson: PersonStat | null;
  mostNominatedFilm: FilmStat | null;
  mostWinningFilm: FilmStat | null;
  mostCompetitiveYear: { awardYear: number; totalNominations: number } | null;
  decadeBreakdown: { decade: number; filmCount: number; avgNominations: number }[];
  awardBodyBreakdown: {
    oscarOnly: number;
    ggOnly: number;
    cannesOnly: number;
    multiAward: number;
    total: number;
  } | null;
  topRolledFilms: FilmStat[];
  topWatchlistedFilms: FilmStat[];
};

async function fetchStats(): Promise<StatsResponse | null> {
  try {
    const res = await fetch(`${API_URL}/api/stats`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    return res.json() as Promise<StatsResponse>;
  } catch {
    return null;
  }
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase();
}

export default async function StatsPage() {
  const stats = await fetchStats();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Award Film Stats & Records | CineRoll",
    description: metadata.description,
    url: "https://cineroll.app/stats",
    mainEntity: {
      "@type": "Dataset",
      name: "CineRoll Award Film Statistics",
      description:
        "Statistics about Oscar, Golden Globe, and Cannes-nominated and winning films, including most decorated people and films.",
    },
  };

  const maxAvgNom =
    Math.max(...(stats?.decadeBreakdown.map((d) => d.avgNominations) ?? [1])) || 1;
  const awardTotal = stats?.awardBodyBreakdown?.total || 1;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="min-h-screen bg-[#09090f] text-[#F5F5F0]">
        <AppHeader />

        <main className="mx-auto max-w-screen-xl px-4 pb-20 pt-10 sm:px-6 lg:px-10">
          {/* Page header */}
          <div className="mb-10 flex items-start gap-4">
            <div className="flex flex-col gap-[3px] pt-2">
              <div className="h-[2px] w-6 bg-[#e8453c]" />
              <div className="h-[2px] w-3.5 bg-[#e8453c]/35" />
            </div>
            <div>
              <p className="mb-1 font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.35em] text-[#e8453c]/60">
                By the Numbers
              </p>
              <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold text-[#F5F5F0] sm:text-5xl">
                Stats &amp; Records
              </h1>
              <p className="mt-2 max-w-xl font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest text-[#888899]">
                Oscar · Golden Globe · Cannes — across our full dataset
              </p>
            </div>
          </div>

          {/* Summary strip */}
          {stats && (
            <div className="mb-10 grid grid-cols-3 gap-3 sm:gap-4">
              {[
                { label: "Films", value: stats.summary.totalFilms.toLocaleString(), icon: Film },
                {
                  label: "Nominations",
                  value: stats.summary.totalNominations.toLocaleString(),
                  icon: Star,
                },
                {
                  label: "Wins",
                  value: stats.summary.totalWins.toLocaleString(),
                  icon: Trophy,
                },
              ].map(({ label, value, icon: Icon }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-[#1a1a28] bg-[#0e0e18] p-5 sm:p-6"
                >
                  <Icon className="mb-3 h-4 w-4 text-[#e8453c]/60" />
                  <p className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#F5F5F0] sm:text-4xl">
                    {value}
                  </p>
                  <p className="mt-1 font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-widest text-[#888899]">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Record holders grid */}
          {stats && (
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Most nominated person */}
              {stats.mostNominatedPerson && (
                <div className="rounded-2xl border border-[#1a1a28] bg-[#0e0e18] p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <Star className="h-3.5 w-3.5 text-[#4a9eff]" />
                    <span className="font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.3em] text-[#4a9eff]/80">
                      Most Nominated
                    </span>
                  </div>
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#4a9eff]/10 font-[family-name:var(--font-display)] text-lg font-bold text-[#4a9eff]">
                    {initials(stats.mostNominatedPerson.name)}
                  </div>
                  <p className="font-[family-name:var(--font-display)] text-lg font-bold leading-tight text-[#F5F5F0]">
                    {stats.mostNominatedPerson.name}
                  </p>
                  <p className="mt-1 font-[family-name:var(--font-geist-mono)] text-[10px] text-[#888899]">
                    {stats.mostNominatedPerson.count} nominations
                  </p>
                </div>
              )}

              {/* Most winning person */}
              {stats.mostWinningPerson && (
                <div className="rounded-2xl border border-[#1a1a28] bg-[#0e0e18] p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <Trophy className="h-3.5 w-3.5 text-[#e8453c]" />
                    <span className="font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.3em] text-[#e8453c]/80">
                      Most Wins
                    </span>
                  </div>
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#e8453c]/10 font-[family-name:var(--font-display)] text-lg font-bold text-[#e8453c]">
                    {initials(stats.mostWinningPerson.name)}
                  </div>
                  <p className="font-[family-name:var(--font-display)] text-lg font-bold leading-tight text-[#F5F5F0]">
                    {stats.mostWinningPerson.name}
                  </p>
                  <p className="mt-1 font-[family-name:var(--font-geist-mono)] text-[10px] text-[#888899]">
                    {stats.mostWinningPerson.count} wins
                  </p>
                </div>
              )}

              {/* Most nominated film */}
              {stats.mostNominatedFilm && (
                <Link
                  href={`/film/${stats.mostNominatedFilm.slug}`}
                  className="group rounded-2xl border border-[#1a1a28] bg-[#0e0e18] p-5 transition-colors hover:border-[#a78bfa]/40"
                >
                  <div className="mb-4 flex items-center gap-2">
                    <Award className="h-3.5 w-3.5 text-[#a78bfa]" />
                    <span className="font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.3em] text-[#a78bfa]/80">
                      Most Nominated Film
                    </span>
                  </div>
                  <div className="mb-3 flex items-center gap-3">
                    {stats.mostNominatedFilm.posterUrl && (
                      <Image
                        src={stats.mostNominatedFilm.posterUrl}
                        alt={stats.mostNominatedFilm.title}
                        width={40}
                        height={60}
                        className="rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <p className="font-[family-name:var(--font-display)] text-base font-bold leading-tight text-[#F5F5F0] group-hover:text-[#a78bfa] transition-colors">
                        {stats.mostNominatedFilm.title}
                      </p>
                      <p className="mt-0.5 font-[family-name:var(--font-geist-mono)] text-[9px] text-[#888899]">
                        {stats.mostNominatedFilm.releaseYear}
                      </p>
                    </div>
                  </div>
                  <p className="font-[family-name:var(--font-geist-mono)] text-[10px] text-[#888899]">
                    {stats.mostNominatedFilm.count} nominations
                  </p>
                </Link>
              )}

              {/* Most winning film */}
              {stats.mostWinningFilm && (
                <Link
                  href={`/film/${stats.mostWinningFilm.slug}`}
                  className="group rounded-2xl border border-[#1a1a28] bg-[#0e0e18] p-5 transition-colors hover:border-[#e8453c]/40"
                >
                  <div className="mb-4 flex items-center gap-2">
                    <Trophy className="h-3.5 w-3.5 text-[#e8453c]" />
                    <span className="font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.3em] text-[#e8453c]/80">
                      Most Awarded Film
                    </span>
                  </div>
                  <div className="mb-3 flex items-center gap-3">
                    {stats.mostWinningFilm.posterUrl && (
                      <Image
                        src={stats.mostWinningFilm.posterUrl}
                        alt={stats.mostWinningFilm.title}
                        width={40}
                        height={60}
                        className="rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <p className="font-[family-name:var(--font-display)] text-base font-bold leading-tight text-[#F5F5F0] group-hover:text-[#e8453c] transition-colors">
                        {stats.mostWinningFilm.title}
                      </p>
                      <p className="mt-0.5 font-[family-name:var(--font-geist-mono)] text-[9px] text-[#888899]">
                        {stats.mostWinningFilm.releaseYear}
                      </p>
                    </div>
                  </div>
                  <p className="font-[family-name:var(--font-geist-mono)] text-[10px] text-[#888899]">
                    {stats.mostWinningFilm.count} wins
                  </p>
                </Link>
              )}
            </div>
          )}

          {/* Most competitive year */}
          {stats?.mostCompetitiveYear && (
            <div className="mb-8">
              <Link
                href={`/browse?awardYear=${stats.mostCompetitiveYear.awardYear}`}
                className="group flex items-center justify-between rounded-2xl border border-[#1a1a28] bg-[#0e0e18] p-5 transition-colors hover:border-[#e8453c]/30 sm:p-6"
              >
                <div className="flex items-center gap-5">
                  <Calendar className="h-5 w-5 shrink-0 text-[#e8453c]/60" />
                  <div>
                    <p className="font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.3em] text-[#888899]">
                      Most Competitive Ceremony Year
                    </p>
                    <p className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold text-[#F5F5F0] sm:text-4xl">
                      {stats.mostCompetitiveYear.awardYear}
                    </p>
                  </div>
                  <div className="hidden h-10 w-px bg-[#1a1a28] sm:block" />
                  <div className="hidden sm:block">
                    <p className="font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.3em] text-[#888899]">
                      Total Nominations
                    </p>
                    <p className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold text-[#e8453c]">
                      {stats.mostCompetitiveYear.totalNominations.toLocaleString()}
                    </p>
                  </div>
                </div>
                <span className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-widest text-[#888899] transition-colors group-hover:text-[#F5F5F0]">
                  Browse →
                </span>
              </Link>
            </div>
          )}

          <div className="mb-8 grid gap-6 lg:grid-cols-2">
            {/* Decade timeline */}
            {stats && stats.decadeBreakdown.length > 0 && (
              <div className="rounded-2xl border border-[#1a1a28] bg-[#0e0e18] p-5 sm:p-7">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-3.5 w-3.5 text-[#4a9eff]/60" />
                    <h2 className="font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.3em] text-[#888899]">
                      Avg. Nominations by Decade
                    </h2>
                  </div>
                  <span className="font-[family-name:var(--font-geist-mono)] text-[8px] text-[#666680]">
                    Oscar · GG · Cannes
                  </span>
                </div>

                {/* Chart */}
                <div className="relative">
                  {/* Horizontal grid lines */}
                  <div className="pointer-events-none absolute inset-x-0 top-0" style={{ height: "160px" }}>
                    {[0.25, 0.5, 0.75, 1].map((f) => (
                      <div
                        key={f}
                        className="absolute inset-x-0 flex items-center"
                        style={{ bottom: `${f * 100}%` }}
                      >
                        <span className="mr-2 w-5 shrink-0 text-right font-[family-name:var(--font-geist-mono)] text-[7px] text-[#333350]">
                          {(maxAvgNom * f).toFixed(1)}
                        </span>
                        <div className="h-px flex-1 bg-white/[0.04]" />
                      </div>
                    ))}
                  </div>

                  {/* Bars */}
                  <div className="flex items-end gap-1.5 pl-7" style={{ height: "160px" }}>
                    {stats.decadeBreakdown.map((d) => {
                      const heightPct = Math.max(3, (d.avgNominations / maxAvgNom) * 100);
                      const isPeak = d.avgNominations >= maxAvgNom * 0.97;
                      return (
                        <Link
                          key={d.decade}
                          href={`/browse?decadeMin=${d.decade}&decadeMax=${d.decade + 9}`}
                          className="group relative flex flex-1 flex-col items-center"
                          title={`${d.decade}s — ${d.filmCount} films, avg ${d.avgNominations.toFixed(1)} noms`}
                        >
                          {/* Tooltip */}
                          <div className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                            <div className="rounded-lg border border-[#2a2a3e] bg-[#13131f] px-2 py-1">
                              <span className="font-[family-name:var(--font-geist-mono)] text-[9px] text-[#F5F5F0]">
                                {d.avgNominations.toFixed(1)}
                              </span>
                            </div>
                          </div>

                          {/* Bar */}
                          <div className="relative w-full" style={{ height: `${heightPct}%` }}>
                            {/* Bright top cap */}
                            <div
                              className="absolute inset-x-0 top-0 h-[2px] rounded-t-sm transition-opacity duration-200 group-hover:opacity-100"
                              style={{
                                backgroundColor: "#4a9eff",
                                opacity: isPeak ? 1 : 0.45,
                              }}
                            />
                            {/* Gradient fill */}
                            <div
                              className="absolute inset-x-0 bottom-0 transition-all duration-200"
                              style={{
                                top: "2px",
                                borderRadius: "0 0 2px 2px",
                                background: isPeak
                                  ? "linear-gradient(to bottom, rgba(74,158,255,0.55), rgba(74,158,255,0.07))"
                                  : "linear-gradient(to bottom, rgba(74,158,255,0.22), rgba(74,158,255,0.03))",
                                boxShadow: isPeak ? "0 0 28px rgba(74,158,255,0.18)" : "none",
                              }}
                            />
                            {/* Hover brighten overlay */}
                            <div
                              className="absolute inset-x-0 bottom-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                              style={{
                                top: "2px",
                                background: "linear-gradient(to bottom, rgba(74,158,255,0.2), transparent)",
                              }}
                            />
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  {/* Decade labels */}
                  <div className="mt-2.5 flex gap-1.5 pl-7">
                    {stats.decadeBreakdown.map((d) => (
                      <div key={d.decade} className="flex flex-1 justify-center">
                        <span className="font-[family-name:var(--font-geist-mono)] text-[7px] uppercase tracking-wider text-[#666680]">
                          {String(d.decade).slice(2)}s
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Award body breakdown */}
            {stats?.awardBodyBreakdown && (
              <div className="rounded-2xl border border-[#1a1a28] bg-[#0e0e18] p-5 sm:p-6">
                <div className="mb-5 flex items-center gap-2">
                  <Award className="h-3.5 w-3.5 text-[#e8453c]/60" />
                  <h2 className="font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.3em] text-[#888899]">
                    Films by Award Body
                  </h2>
                </div>

                {/* Segmented bar */}
                <div className="mb-5 flex h-3 overflow-hidden rounded-full">
                  {[
                    { key: "oscarOnly", color: "#e8453c", label: "Oscar only", href: "/browse?awardBody=oscar" },
                    { key: "ggOnly", color: "#f59e0b", label: "Golden Globe only", href: "/browse?awardBody=goldenglobe" },
                    { key: "cannesOnly", color: "#4a9eff", label: "Cannes only", href: "/browse?awardBody=cannes" },
                    { key: "multiAward", color: "#a78bfa", label: "Multiple", href: "/browse" },
                  ].map(({ key, color }) => {
                    const count = stats.awardBodyBreakdown![key as keyof typeof stats.awardBodyBreakdown] as number;
                    const pct = (count / awardTotal) * 100;
                    return (
                      <div
                        key={key}
                        className="h-full transition-opacity hover:opacity-80"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    );
                  })}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Oscar Only", count: stats.awardBodyBreakdown.oscarOnly, color: "#e8453c", href: "/browse?awardBody=oscar" },
                    { label: "Golden Globe Only", count: stats.awardBodyBreakdown.ggOnly, color: "#f59e0b", href: "/browse?awardBody=goldenglobe" },
                    { label: "Cannes Only", count: stats.awardBodyBreakdown.cannesOnly, color: "#4a9eff", href: "/browse?awardBody=cannes" },
                    { label: "Multi-Award", count: stats.awardBodyBreakdown.multiAward, color: "#a78bfa", href: "/browse" },
                  ].map(({ label, count, color, href }) => (
                    <Link
                      key={label}
                      href={href}
                      className="group rounded-xl border border-[#1a1a28] p-3 transition-colors hover:border-[#2a2a3e]"
                    >
                      <div className="mb-1 flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
                        <span className="font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-wider text-[#888899]">
                          {label}
                        </span>
                      </div>
                      <p className="font-[family-name:var(--font-display)] text-xl font-bold text-[#F5F5F0]">
                        {count.toLocaleString()}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Trending on CineRoll */}
          {stats && (stats.topRolledFilms.length > 0 || stats.topWatchlistedFilms.length > 0) && (
            <div className="rounded-2xl border border-[#1a1a28] bg-[#0e0e18] p-5 sm:p-6">
              <div className="mb-5 flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-[#e8453c]/60" />
                <h2 className="font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.3em] text-[#888899]">
                  Currently Trending on CineRoll
                </h2>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                {stats.topRolledFilms.length > 0 && (
                  <div>
                    <p className="mb-3 font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-widest text-[#666680]">
                      Most Rolled
                    </p>
                    <ol className="flex flex-col gap-2">
                      {stats.topRolledFilms.map((film, i) => (
                        <li key={film.id}>
                          <Link
                            href={`/film/${film.slug}`}
                            className="group flex items-center gap-3"
                          >
                            <span className="w-4 shrink-0 font-[family-name:var(--font-geist-mono)] text-[10px] text-[#666680]">
                              {i + 1}
                            </span>
                            {film.posterUrl && (
                              <Image
                                src={film.posterUrl}
                                alt={film.title}
                                width={28}
                                height={42}
                                className="rounded object-cover"
                              />
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-[family-name:var(--font-geist-mono)] text-[11px] text-[#c8c8d8] transition-colors group-hover:text-[#F5F5F0]">
                                {film.title}
                              </p>
                              <p className="font-[family-name:var(--font-geist-mono)] text-[9px] text-[#666680]">
                                {film.count.toLocaleString()} rolls
                              </p>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {stats.topWatchlistedFilms.length > 0 && (
                  <div>
                    <p className="mb-3 font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-widest text-[#666680]">
                      Most Watchlisted
                    </p>
                    <ol className="flex flex-col gap-2">
                      {stats.topWatchlistedFilms.map((film, i) => (
                        <li key={film.id}>
                          <Link
                            href={`/film/${film.slug}`}
                            className="group flex items-center gap-3"
                          >
                            <span className="w-4 shrink-0 font-[family-name:var(--font-geist-mono)] text-[10px] text-[#666680]">
                              {i + 1}
                            </span>
                            {film.posterUrl && (
                              <Image
                                src={film.posterUrl}
                                alt={film.title}
                                width={28}
                                height={42}
                                className="rounded object-cover"
                              />
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-[family-name:var(--font-geist-mono)] text-[11px] text-[#c8c8d8] transition-colors group-hover:text-[#F5F5F0]">
                                {film.title}
                              </p>
                              <p className="font-[family-name:var(--font-geist-mono)] text-[9px] text-[#666680]">
                                {film.count.toLocaleString()} saves
                              </p>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </div>
          )}

          {!stats && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-widest text-[#666680]">
                Stats unavailable — make sure the backend is running
              </p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
