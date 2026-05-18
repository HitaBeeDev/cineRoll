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

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0] ?? "").join("").toUpperCase();
}

function SectionLabel({ index, label }: { index: string; label: string }) {
  return (
    <div className="mb-8 flex items-center gap-4">
      <span className="font-[family-name:var(--font-geist-mono)] text-[8px] font-bold uppercase tracking-[0.35em] text-[#e8453c]/50">
        ◈ {index}
      </span>
      <div className="h-px flex-1 bg-white/[0.05]" />
      <span className="font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.35em] text-[#666680]">
        {label}
      </span>
    </div>
  );
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

        {/* ── HERO ──────────────────────────────────────────────────── */}
        <section className="relative border-b border-white/[0.05] px-6 pb-16 pt-14 sm:px-10 lg:px-16">
          <p className="mb-6 font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.4em] text-[#e8453c]/60">
            ◈ CineRoll · Annual Record ◈
          </p>
          <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <h1 className="font-[family-name:var(--font-display)] text-6xl font-black leading-[0.92] tracking-tight text-[#F0F0EB] sm:text-7xl lg:text-[7rem]">
              Stats &amp;<br />Records
            </h1>
            <div className="lg:text-right">
              <p className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.3em] text-[#666680]">
                Oscar · Golden Globe · Cannes
              </p>
              <p className="mt-1 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.3em] text-[#666680]">
                Across our full dataset
              </p>
            </div>
          </div>
        </section>

        <main className="px-6 pb-24 sm:px-10 lg:px-16">

          {/* ── THE NUMBERS ───────────────────────────────────────────── */}
          {stats && (
            <section className="border-b border-white/[0.05] py-16">
              <SectionLabel index="01" label="The Numbers" />
              <div className="grid grid-cols-1 gap-0 divide-y divide-white/[0.05] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                {[
                  { value: stats.summary.totalFilms.toLocaleString(), label: "Films in the dataset", sub: "From 1927 to present" },
                  { value: stats.summary.totalNominations.toLocaleString(), label: "Award nominations", sub: "Oscar + Golden Globe + Cannes" },
                  { value: stats.summary.totalWins.toLocaleString(), label: "Total wins", sub: "Across all three bodies" },
                ].map(({ value, label, sub }) => (
                  <div key={label} className="py-8 sm:px-10 first:pl-0 last:pr-0">
                    <p className="font-[family-name:var(--font-display)] text-6xl font-black leading-none tracking-tight text-[#F0F0EB] sm:text-7xl">
                      {value}
                    </p>
                    <p className="mt-3 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.25em] text-[#888899]">
                      {label}
                    </p>
                    <p className="mt-1 font-[family-name:var(--font-geist-mono)] text-[9px] text-[#666680]">
                      {sub}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── RECORD FILMS ──────────────────────────────────────────── */}
          {stats && (stats.mostWinningFilm ?? stats.mostNominatedFilm) && (
            <section className="border-b border-white/[0.05] py-16">
              <SectionLabel index="02" label="Record-Holding Films" />
              <div className="grid gap-4 lg:grid-cols-2">

                {/* Most awarded film — hero card */}
                {stats.mostWinningFilm && (
                  <Link
                    href={`/film/${stats.mostWinningFilm.slug}`}
                    className="group relative overflow-hidden rounded-2xl"
                    style={{ minHeight: "380px" }}
                  >
                    {stats.mostWinningFilm.posterUrl && (
                      <Image
                        src={stats.mostWinningFilm.posterUrl}
                        alt={stats.mostWinningFilm.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.04]"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#07070d] via-[#07070d]/60 to-[#07070d]/20" />
                    <div className="absolute inset-0 flex flex-col justify-end p-7">
                      <p className="mb-3 font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.35em] text-[#e8453c]/80">
                        ◈ Most Awarded Film
                      </p>
                      <h2 className="font-[family-name:var(--font-display)] text-4xl font-black leading-[1.05] text-[#F0F0EB] transition-colors group-hover:text-white sm:text-5xl">
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

                {/* Most nominated film */}
                {stats.mostNominatedFilm && (
                  <Link
                    href={`/film/${stats.mostNominatedFilm.slug}`}
                    className="group relative overflow-hidden rounded-2xl"
                    style={{ minHeight: "380px" }}
                  >
                    {stats.mostNominatedFilm.posterUrl && (
                      <Image
                        src={stats.mostNominatedFilm.posterUrl}
                        alt={stats.mostNominatedFilm.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.04]"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#07070d] via-[#07070d]/60 to-[#07070d]/20" />
                    <div className="absolute inset-0 flex flex-col justify-end p-7">
                      <p className="mb-3 font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.35em] text-[#a78bfa]/80">
                        ◈ Most Nominated Film
                      </p>
                      <h2 className="font-[family-name:var(--font-display)] text-4xl font-black leading-[1.05] text-[#F0F0EB] transition-colors group-hover:text-white sm:text-5xl">
                        {stats.mostNominatedFilm.title}
                      </h2>
                      <div className="mt-3 flex items-end justify-between">
                        <div>
                          <p className="font-[family-name:var(--font-geist-mono)] text-[10px] text-[#888899]">
                            {stats.mostNominatedFilm.releaseYear}
                          </p>
                          <p className="mt-0.5 font-[family-name:var(--font-display)] text-2xl font-bold text-[#a78bfa]">
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

          {/* ── RECORD PEOPLE ─────────────────────────────────────────── */}
          {stats && (stats.mostNominatedPerson ?? stats.mostWinningPerson) && (
            <section className="border-b border-white/[0.05] py-16">
              <SectionLabel index="03" label="Record-Holding People" />
              <div className="grid gap-4 sm:grid-cols-2">
                {stats.mostNominatedPerson && (
                  <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c15] p-8">
                    <p className="mb-6 font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.35em] text-[#4a9eff]/70">
                      ◈ Most Nominated Person
                    </p>
                    <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#4a9eff]/10 font-[family-name:var(--font-display)] text-2xl font-black text-[#4a9eff]">
                      {initials(stats.mostNominatedPerson.name)}
                    </div>
                    <h2 className="font-[family-name:var(--font-display)] text-3xl font-black leading-tight text-[#F0F0EB] sm:text-4xl">
                      {stats.mostNominatedPerson.name}
                    </h2>
                    <p className="mt-3 font-[family-name:var(--font-display)] text-5xl font-black text-[#4a9eff]">
                      {stats.mostNominatedPerson.count}
                    </p>
                    <p className="mt-1 font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.3em] text-[#666680]">
                      nominations across all award bodies
                    </p>
                  </div>
                )}
                {stats.mostWinningPerson && (
                  <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c15] p-8">
                    <p className="mb-6 font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.35em] text-[#e8453c]/70">
                      ◈ Most Winning Person
                    </p>
                    <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e8453c]/10 font-[family-name:var(--font-display)] text-2xl font-black text-[#e8453c]">
                      {initials(stats.mostWinningPerson.name)}
                    </div>
                    <h2 className="font-[family-name:var(--font-display)] text-3xl font-black leading-tight text-[#F0F0EB] sm:text-4xl">
                      {stats.mostWinningPerson.name}
                    </h2>
                    <p className="mt-3 font-[family-name:var(--font-display)] text-5xl font-black text-[#e8453c]">
                      {stats.mostWinningPerson.count}
                    </p>
                    <p className="mt-1 font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.3em] text-[#666680]">
                      wins across all award bodies
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ── THE YEAR ──────────────────────────────────────────────── */}
          {stats?.mostCompetitiveYear && (
            <section className="border-b border-white/[0.05] py-16">
              <SectionLabel index="04" label="Most Contested Year" />
              <Link
                href={`/browse?awardYear=${stats.mostCompetitiveYear.awardYear}`}
                className="group relative block overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0c0c15] px-8 py-14 text-center sm:px-16"
              >
                {/* Ghost year in background */}
                <p
                  className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none text-center font-[family-name:var(--font-display)] font-black text-white/[0.03]"
                  style={{ fontSize: "clamp(8rem, 28vw, 22rem)", lineHeight: 1 }}
                  aria-hidden
                >
                  {stats.mostCompetitiveYear.awardYear}
                </p>
                <p className="relative mb-4 font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.4em] text-[#888899]">
                  The most contested year in awards history
                </p>
                <p className="relative font-[family-name:var(--font-display)] text-7xl font-black leading-none tracking-tight text-[#F0F0EB] sm:text-8xl lg:text-[9rem]">
                  {stats.mostCompetitiveYear.awardYear}
                </p>
                <p className="relative mt-5 font-[family-name:var(--font-display)] text-3xl font-bold text-[#e8453c] sm:text-4xl">
                  {stats.mostCompetitiveYear.totalNominations.toLocaleString()} nominations
                </p>
                <div className="relative mt-6 inline-flex items-center gap-2 font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.3em] text-[#666680] transition-colors group-hover:text-[#888899]">
                  Browse this year
                  <ArrowUpRight className="h-3 w-3" />
                </div>
              </Link>
            </section>
          )}

          {/* ── AWARD BODIES ──────────────────────────────────────────── */}
          {stats?.awardBodyBreakdown && (
            <section className="border-b border-white/[0.05] py-16">
              <SectionLabel index="05" label="Films by Award Body" />
              {/* Tall segmented bar */}
              <div className="mb-6 flex h-6 overflow-hidden rounded-lg">
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
                      className="h-full transition-opacity hover:opacity-75"
                      style={{ width: `${(count / awardTotal) * 100}%`, backgroundColor: color }}
                    />
                  );
                })}
              </div>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {[
                  { label: "Oscar Only", count: stats.awardBodyBreakdown.oscarOnly, color: "#e8453c", href: "/browse?awardBody=oscar" },
                  { label: "Golden Globe Only", count: stats.awardBodyBreakdown.ggOnly, color: "#f59e0b", href: "/browse?awardBody=goldenglobe" },
                  { label: "Cannes Only", count: stats.awardBodyBreakdown.cannesOnly, color: "#4a9eff", href: "/browse?awardBody=cannes" },
                  { label: "Multi-Award", count: stats.awardBodyBreakdown.multiAward, color: "#a78bfa", href: "/browse" },
                ].map(({ label, count, color, href }) => (
                  <Link
                    key={label}
                    href={href}
                    className="group rounded-2xl border border-white/[0.06] bg-[#0c0c15] p-5 transition-colors hover:border-white/10"
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                      <span className="font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.3em] text-[#888899]">
                        {label}
                      </span>
                    </div>
                    <p className="font-[family-name:var(--font-display)] text-3xl font-black text-[#F0F0EB]">
                      {count.toLocaleString()}
                    </p>
                    <p className="mt-1 font-[family-name:var(--font-geist-mono)] text-[8px] text-[#666680]">
                      {((count / awardTotal) * 100).toFixed(1)}% of total
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* ── TRENDING ──────────────────────────────────────────────── */}
          {stats && stats.topRolledFilms.length > 0 && (
            <section className="py-16">
              <SectionLabel index="06" label="Trending on CineRoll" />
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Most rolled */}
                <div>
                  <p className="mb-5 font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.35em] text-[#888899]">
                    Most Rolled This Week
                  </p>
                  <ol className="flex flex-col">
                    {stats.topRolledFilms.map((film, i) => (
                      <li key={film.id} className="border-t border-white/[0.05] first:border-t-0">
                        <Link
                          href={`/film/${film.slug}`}
                          className="group flex items-center gap-4 py-4 transition-colors hover:bg-white/[0.02]"
                        >
                          <span className="w-6 shrink-0 font-[family-name:var(--font-display)] text-xl font-black text-[#666680]">
                            {i + 1}
                          </span>
                          {film.posterUrl && (
                            <Image
                              src={film.posterUrl}
                              alt={film.title}
                              width={36}
                              height={54}
                              className="shrink-0 rounded-lg object-cover"
                            />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-[family-name:var(--font-display)] text-base font-bold text-[#c8c8d8] transition-colors group-hover:text-[#F0F0EB]">
                              {film.title}
                            </p>
                            <p className="font-[family-name:var(--font-geist-mono)] text-[9px] text-[#666680]">
                              {film.releaseYear}
                            </p>
                          </div>
                          <span className="shrink-0 font-[family-name:var(--font-geist-mono)] text-[10px] text-[#e8453c]/70">
                            {film.count.toLocaleString()} rolls
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Most watchlisted */}
                {stats.topWatchlistedFilms.length > 0 && (
                  <div>
                    <p className="mb-5 font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.35em] text-[#888899]">
                      Most Watchlisted
                    </p>
                    <ol className="flex flex-col">
                      {stats.topWatchlistedFilms.map((film, i) => (
                        <li key={film.id} className="border-t border-white/[0.05] first:border-t-0">
                          <Link
                            href={`/film/${film.slug}`}
                            className="group flex items-center gap-4 py-4 transition-colors hover:bg-white/[0.02]"
                          >
                            <span className="w-6 shrink-0 font-[family-name:var(--font-display)] text-xl font-black text-[#666680]">
                              {i + 1}
                            </span>
                            {film.posterUrl && (
                              <Image
                                src={film.posterUrl}
                                alt={film.title}
                                width={36}
                                height={54}
                                className="shrink-0 rounded-lg object-cover"
                              />
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-[family-name:var(--font-display)] text-base font-bold text-[#c8c8d8] transition-colors group-hover:text-[#F0F0EB]">
                                {film.title}
                              </p>
                              <p className="font-[family-name:var(--font-geist-mono)] text-[9px] text-[#666680]">
                                {film.releaseYear}
                              </p>
                            </div>
                            <span className="shrink-0 font-[family-name:var(--font-geist-mono)] text-[10px] text-[#4a9eff]/70">
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
