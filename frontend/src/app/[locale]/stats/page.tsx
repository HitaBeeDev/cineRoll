import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { AppHeader } from "@/components/app-header";
import { ArrowUpRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Award Film Stats & Records | CineRoll",
  description:
    "Discover the most nominated and award-winning films and people across the Oscars, Golden Globes, and Cannes. Explore CineRoll's full award film dataset by the numbers.",
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
    const res = await fetch(`${API_URL}/api/stats`, { next: { revalidate: 86400 } });
    if (!res.ok) return null;
    return res.json() as Promise<StatsResponse>;
  } catch {
    return null;
  }
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
      description: "Statistics about Oscar, Golden Globe, and Cannes-nominated and winning films.",
    },
  };

  const awardTotal = stats?.awardBodyBreakdown?.total || 1;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="min-h-screen bg-[#07070d] text-[#F0F0EB]">
        <AppHeader />

        {/* HERO */}
        <section className="border-b border-white/[0.05] px-6 pb-14 pt-14 sm:px-10 lg:px-16">
          <p className="mb-5 font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.4em] text-[#e8453c]/60">
            ◈ CineRoll · Annual Record ◈
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-6xl font-black leading-[0.92] tracking-tight text-[#F0F0EB] sm:text-7xl lg:text-[7rem]">
            Stats &amp;<br />Records
          </h1>
          {stats && (
            <p className="mt-6 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.25em] text-[#555566]">
              {stats.summary.totalFilms.toLocaleString()} films
              <span className="mx-3 text-[#333346]">·</span>
              {stats.summary.totalNominations.toLocaleString()} nominations
              <span className="mx-3 text-[#333346]">·</span>
              {stats.summary.totalWins.toLocaleString()} wins
            </p>
          )}
        </section>

        <main className="px-6 pb-24 sm:px-10 lg:px-16">

          {/* THE NUMBERS — bento grid */}
          {stats && (
            <section className="border-b border-white/[0.05] py-14">
              <p className="mb-6 font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.35em] text-[#444458]">
                The Numbers
              </p>
              <div className="grid grid-cols-3 gap-3">
                {/* Hero cell */}
                <div className="col-span-2 flex min-h-[200px] flex-col justify-between rounded-2xl border border-white/[0.06] bg-[#0c0c15] p-7 sm:p-9">
                  <p className="font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.3em] text-[#555566]">
                    Oscar · Golden Globe · Cannes
                  </p>
                  <div>
                    <p className="font-[family-name:var(--font-display)] text-[4.5rem] font-black leading-none tracking-tight text-[#F0F0EB] sm:text-[6.5rem] lg:text-[8rem]">
                      {stats.summary.totalNominations.toLocaleString()}
                    </p>
                    <p className="mt-2 font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.2em] text-[#888899]">
                      Award nominations
                    </p>
                  </div>
                </div>
                {/* Right column */}
                <div className="flex flex-col gap-3">
                  <div className="flex flex-1 flex-col justify-between rounded-2xl border border-white/[0.06] bg-[#0c0c15] p-5 sm:p-6">
                    <p className="font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.25em] text-[#555566]">Films</p>
                    <div>
                      <p className="font-[family-name:var(--font-display)] text-3xl font-black leading-none text-[#F0F0EB] sm:text-4xl">
                        {stats.summary.totalFilms.toLocaleString()}
                      </p>
                      <p className="mt-1 font-[family-name:var(--font-geist-mono)] text-[8px] text-[#444458]">1927 – present</p>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col justify-between rounded-2xl border border-white/[0.06] bg-[#0c0c15] p-5 sm:p-6">
                    <p className="font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.25em] text-[#555566]">Wins</p>
                    <div>
                      <p className="font-[family-name:var(--font-display)] text-3xl font-black leading-none text-[#e8453c] sm:text-4xl">
                        {stats.summary.totalWins.toLocaleString()}
                      </p>
                      <p className="mt-1 font-[family-name:var(--font-geist-mono)] text-[8px] text-[#444458]">across all bodies</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* RECORD FILMS — asymmetric 3/5 + 2/5 */}
          {stats && (stats.mostWinningFilm ?? stats.mostNominatedFilm) && (
            <section className="border-b border-white/[0.05] py-14">
              <p className="mb-6 font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.35em] text-[#444458]">
                Record-Holding Films
              </p>
              <div className="grid gap-3 sm:grid-cols-5">
                {stats.mostWinningFilm && (
                  <Link
                    href={`/film/${stats.mostWinningFilm.slug}`}
                    className="group relative col-span-3 overflow-hidden rounded-2xl"
                    style={{ minHeight: "420px" }}
                  >
                    {stats.mostWinningFilm.posterUrl && (
                      <Image
                        src={stats.mostWinningFilm.posterUrl}
                        alt={stats.mostWinningFilm.title}
                        fill
                        sizes="(max-width: 640px) 100vw, 60vw"
                        className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.04]"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#07070d] via-[#07070d]/50 to-transparent" />
                    <div className="absolute inset-0 flex flex-col justify-end p-7">
                      <p className="mb-3 font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.35em] text-[#e8453c]/80">
                        ◈ Most Awarded Film
                      </p>
                      <h2 className="font-[family-name:var(--font-display)] text-4xl font-black leading-[1.05] text-[#F0F0EB] sm:text-5xl">
                        {stats.mostWinningFilm.title}
                      </h2>
                      <div className="mt-3 flex items-end justify-between">
                        <div>
                          <p className="font-[family-name:var(--font-geist-mono)] text-[10px] text-[#888899]">
                            {stats.mostWinningFilm.releaseYear}
                          </p>
                          <p className="mt-0.5 font-[family-name:var(--font-display)] text-2xl font-bold text-[#e8453c]">
                            {stats.mostWinningFilm.count} wins
                          </p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/60 transition-all group-hover:border-[#e8453c] group-hover:text-[#e8453c]">
                          <ArrowUpRight className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </Link>
                )}
                {stats.mostNominatedFilm && (
                  <Link
                    href={`/film/${stats.mostNominatedFilm.slug}`}
                    className="group relative col-span-2 overflow-hidden rounded-2xl"
                    style={{ minHeight: "420px" }}
                  >
                    {stats.mostNominatedFilm.posterUrl && (
                      <Image
                        src={stats.mostNominatedFilm.posterUrl}
                        alt={stats.mostNominatedFilm.title}
                        fill
                        sizes="(max-width: 640px) 100vw, 40vw"
                        className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.04]"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#07070d] via-[#07070d]/60 to-[#07070d]/20" />
                    <div className="absolute inset-0 flex flex-col justify-end p-7">
                      <p className="mb-3 font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.35em] text-[#a78bfa]/80">
                        ◈ Most Nominated Film
                      </p>
                      <h2 className="font-[family-name:var(--font-display)] text-2xl font-black leading-[1.05] text-[#F0F0EB] sm:text-3xl">
                        {stats.mostNominatedFilm.title}
                      </h2>
                      <div className="mt-3 flex items-end justify-between">
                        <div>
                          <p className="font-[family-name:var(--font-geist-mono)] text-[10px] text-[#888899]">
                            {stats.mostNominatedFilm.releaseYear}
                          </p>
                          <p className="mt-0.5 font-[family-name:var(--font-display)] text-xl font-bold text-[#a78bfa]">
                            {stats.mostNominatedFilm.count} nominations
                          </p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/60 transition-all group-hover:border-[#a78bfa] group-hover:text-[#a78bfa]">
                          <ArrowUpRight className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </Link>
                )}
              </div>
            </section>
          )}

          {/* RECORD PEOPLE — editorial horizontal rows */}
          {stats && (stats.mostNominatedPerson ?? stats.mostWinningPerson) && (
            <section className="border-b border-white/[0.05] py-14">
              <p className="mb-2 font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.35em] text-[#444458]">
                Record-Holding People
              </p>
              <div className="divide-y divide-white/[0.05]">
                {stats.mostNominatedPerson && (
                  <Link
                    href={`/person/${stats.mostNominatedPerson.name.toLowerCase().replace(/\s+/g, "-")}`}
                    className="group flex items-center gap-6 py-10 sm:gap-12"
                  >
                    <p className="w-20 shrink-0 font-[family-name:var(--font-geist-mono)] text-[8px] uppercase leading-relaxed tracking-[0.25em] text-[#4a9eff]/60 sm:w-32">
                      Most<br />Nominated
                    </p>
                    <h2 className="min-w-0 flex-1 font-[family-name:var(--font-display)] text-2xl font-black text-[#c8c8d8] transition-colors group-hover:text-[#F0F0EB] sm:text-4xl lg:text-5xl">
                      {stats.mostNominatedPerson.name}
                    </h2>
                    <div className="shrink-0 text-right">
                      <p className="font-[family-name:var(--font-display)] text-5xl font-black leading-none text-[#4a9eff] sm:text-6xl lg:text-7xl">
                        {stats.mostNominatedPerson.count}
                      </p>
                      <p className="mt-1 font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.2em] text-[#444458]">
                        nominations
                      </p>
                    </div>
                  </Link>
                )}
                {stats.mostWinningPerson && (
                  <Link
                    href={`/person/${stats.mostWinningPerson.name.toLowerCase().replace(/\s+/g, "-")}`}
                    className="group flex items-center gap-6 py-10 sm:gap-12"
                  >
                    <p className="w-20 shrink-0 font-[family-name:var(--font-geist-mono)] text-[8px] uppercase leading-relaxed tracking-[0.25em] text-[#e8453c]/60 sm:w-32">
                      Most<br />Winning
                    </p>
                    <h2 className="min-w-0 flex-1 font-[family-name:var(--font-display)] text-2xl font-black text-[#c8c8d8] transition-colors group-hover:text-[#F0F0EB] sm:text-4xl lg:text-5xl">
                      {stats.mostWinningPerson.name}
                    </h2>
                    <div className="shrink-0 text-right">
                      <p className="font-[family-name:var(--font-display)] text-5xl font-black leading-none text-[#e8453c] sm:text-6xl lg:text-7xl">
                        {stats.mostWinningPerson.count}
                      </p>
                      <p className="mt-1 font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.2em] text-[#444458]">
                        wins
                      </p>
                    </div>
                  </Link>
                )}
              </div>
            </section>
          )}

          {/* MOST CONTESTED YEAR — bold red, no ghost text */}
          {stats?.mostCompetitiveYear && (
            <section className="border-b border-white/[0.05] py-14">
              <p className="mb-6 font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.35em] text-[#444458]">
                Most Contested Year
              </p>
              <Link
                href={`/browse?awardYear=${stats.mostCompetitiveYear.awardYear}`}
                className="group block overflow-hidden rounded-2xl border border-[#e8453c]/15 bg-[#0c0c15] transition-colors hover:border-[#e8453c]/30"
              >
                <div className="h-px bg-[#e8453c]/40" />
                <div className="flex flex-col items-center px-10 py-20 text-center sm:py-28">
                  <p className="mb-4 font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.4em] text-[#666680]">
                    The most contested year in awards history
                  </p>
                  <p
                    className="font-[family-name:var(--font-display)] font-black leading-none text-[#e8453c] transition-opacity group-hover:opacity-90"
                    style={{ fontSize: "clamp(5rem, 22vw, 17rem)" }}
                  >
                    {stats.mostCompetitiveYear.awardYear}
                  </p>
                  <p className="mt-5 font-[family-name:var(--font-display)] text-2xl font-bold text-[#F0F0EB] sm:text-3xl">
                    {stats.mostCompetitiveYear.totalNominations.toLocaleString()} nominations
                  </p>
                  <div className="mt-6 inline-flex items-center gap-2 font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.3em] text-[#555566] transition-colors group-hover:text-[#888899]">
                    Browse this year
                    <ArrowUpRight className="h-3 w-3" />
                  </div>
                </div>
              </Link>
            </section>
          )}

          {/* AWARD BODIES — bar + compact inline row */}
          {stats?.awardBodyBreakdown && (
            <section className="border-b border-white/[0.05] py-14">
              <p className="mb-6 font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.35em] text-[#444458]">
                Films by Award Body
              </p>
              <div className="mb-5 flex h-2 overflow-hidden rounded-full">
                {[
                  { key: "oscarOnly", color: "#e8453c" },
                  { key: "ggOnly", color: "#f59e0b" },
                  { key: "cannesOnly", color: "#4a9eff" },
                  { key: "multiAward", color: "#a78bfa" },
                ].map(({ key, color }) => {
                  const count = stats.awardBodyBreakdown![key as keyof typeof stats.awardBodyBreakdown] as number;
                  return (
                    <div
                      key={key}
                      className="h-full"
                      style={{ width: `${(count / awardTotal) * 100}%`, backgroundColor: color }}
                    />
                  );
                })}
              </div>
              <div className="grid grid-cols-2 divide-x divide-y divide-white/[0.05] overflow-hidden rounded-2xl border border-white/[0.05] lg:grid-cols-4 lg:divide-y-0">
                {[
                  { label: "Oscar Only", count: stats.awardBodyBreakdown.oscarOnly, color: "#e8453c", href: "/browse?awardBody=oscar" },
                  { label: "Golden Globe Only", count: stats.awardBodyBreakdown.ggOnly, color: "#f59e0b", href: "/browse?awardBody=goldenglobe" },
                  { label: "Cannes Only", count: stats.awardBodyBreakdown.cannesOnly, color: "#4a9eff", href: "/browse?awardBody=cannes" },
                  { label: "Multi-Award", count: stats.awardBodyBreakdown.multiAward, color: "#a78bfa", href: "/browse" },
                ].map(({ label, count, color, href }) => (
                  <Link
                    key={label}
                    href={href}
                    className="group bg-[#0c0c15] p-5 transition-colors hover:bg-[#10101c] sm:p-6"
                  >
                    <div className="mb-4 flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
                      <span className="font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.25em] text-[#666680]">
                        {label}
                      </span>
                    </div>
                    <p className="font-[family-name:var(--font-display)] text-3xl font-black text-[#F0F0EB]">
                      {count.toLocaleString()}
                    </p>
                    <p className="mt-1 font-[family-name:var(--font-geist-mono)] text-[8px] text-[#444458]">
                      {((count / awardTotal) * 100).toFixed(1)}% of total
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* TRENDING */}
          {stats && stats.topRolledFilms.length > 0 && (
            <section className="py-14">
              <p className="mb-8 font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.35em] text-[#444458]">
                Trending on CineRoll
              </p>
              <div className="grid gap-10 lg:grid-cols-2">
                <div>
                  <p className="mb-4 font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.3em] text-[#e8453c]/60">
                    Most Rolled This Week
                  </p>
                  <ol className="flex flex-col">
                    {stats.topRolledFilms.map((film, i) => (
                      <li key={film.id} className="border-t border-white/[0.05] first:border-t-0">
                        <Link
                          href={`/film/${film.slug}`}
                          className="group flex items-center gap-4 py-3.5 transition-colors hover:bg-white/[0.02]"
                        >
                          <span className="w-5 shrink-0 font-[family-name:var(--font-display)] text-lg font-black text-[#333346]">
                            {i + 1}
                          </span>
                          {film.posterUrl && (
                            <Image
                              src={film.posterUrl}
                              alt={film.title}
                              width={32}
                              height={48}
                              className="shrink-0 rounded object-cover"
                            />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-[family-name:var(--font-display)] text-sm font-bold text-[#c8c8d8] transition-colors group-hover:text-[#F0F0EB]">
                              {film.title}
                            </p>
                            <p className="font-[family-name:var(--font-geist-mono)] text-[9px] text-[#444458]">
                              {film.releaseYear}
                            </p>
                          </div>
                          <span className="shrink-0 font-[family-name:var(--font-geist-mono)] text-[9px] text-[#e8453c]/60">
                            {film.count.toLocaleString()} rolls
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ol>
                </div>

                {stats.topWatchlistedFilms.length > 0 && (
                  <div>
                    <p className="mb-4 font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.3em] text-[#4a9eff]/60">
                      Most Watchlisted
                    </p>
                    <ol className="flex flex-col">
                      {stats.topWatchlistedFilms.map((film, i) => (
                        <li key={film.id} className="border-t border-white/[0.05] first:border-t-0">
                          <Link
                            href={`/film/${film.slug}`}
                            className="group flex items-center gap-4 py-3.5 transition-colors hover:bg-white/[0.02]"
                          >
                            <span className="w-5 shrink-0 font-[family-name:var(--font-display)] text-lg font-black text-[#333346]">
                              {i + 1}
                            </span>
                            {film.posterUrl && (
                              <Image
                                src={film.posterUrl}
                                alt={film.title}
                                width={32}
                                height={48}
                                className="shrink-0 rounded object-cover"
                              />
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-[family-name:var(--font-display)] text-sm font-bold text-[#c8c8d8] transition-colors group-hover:text-[#F0F0EB]">
                                {film.title}
                              </p>
                              <p className="font-[family-name:var(--font-geist-mono)] text-[9px] text-[#444458]">
                                {film.releaseYear}
                              </p>
                            </div>
                            <span className="shrink-0 font-[family-name:var(--font-geist-mono)] text-[9px] text-[#4a9eff]/60">
                              {film.count.toLocaleString()} saves
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </section>
          )}

          {!stats && (
            <div className="flex flex-col items-center justify-center py-32">
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
