import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowUpRight,
  Award,
  BarChart3,
  Clapperboard,
  Crown,
  Film,
  Trophy,
  Users,
} from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Award Film Stats & Records | CineRoll",
  description:
    "Discover the most nominated and award-winning films and people across the Oscars, Golden Globes, and Cannes. Explore CineRoll's full award film dataset by the numbers.",
};

export const dynamic = "force-dynamic";

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
    berlin: number;
    total: number;
  } | null;
  topRolledFilms: FilmStat[];
  topWatchlistedFilms: FilmStat[];
};

async function fetchStats(): Promise<StatsResponse | null> {
  try {
    const res = await fetch(`${API_URL}/api/stats`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json() as Promise<StatsResponse>;
  } catch {
    return null;
  }
}

const formatNumber = (value: number) => value.toLocaleString();

function personSlug(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
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
  const maxDecadeFilms = Math.max(...(stats?.decadeBreakdown.map((item) => item.filmCount) ?? [1]));

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#08080d] text-[#F5F5F0]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <AppHeader />

      <section className="relative overflow-hidden border-b border-[#24202a] bg-[#0a0a10]">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "256px 256px",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 80% at 82% 15%, rgba(232,69,60,0.12), transparent 58%), linear-gradient(180deg, rgba(255,255,255,0.025), transparent 70%)",
          }}
        />

        <div className="relative mx-auto w-full max-w-[100vw] px-4 py-8 sm:max-w-screen-2xl sm:px-6 sm:py-10 lg:px-8 xl:px-12">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(360px,480px)] lg:items-end">
            <div>
              <div className="mb-3 h-px w-10 bg-[#e8453c]" />
              <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.22em] text-[#e8453c]">
                CineRoll archive
              </p>
              <h1
                className="mt-3 max-w-3xl font-[family-name:var(--font-display)] font-bold leading-none tracking-tight text-[#f4f0f7]"
                style={{ fontSize: "clamp(2.25rem, 5vw, 5.5rem)" }}
              >
                Stats & Records
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#a7a4b8] sm:text-base">
                A live view of CineRoll&apos;s award-film archive across the Oscars, Golden Globes,
                and Cannes.
              </p>
            </div>

            {stats && (
              <div className="grid min-w-0 grid-cols-1 overflow-hidden rounded-lg border border-white/10 bg-white/[0.035] shadow-[0_18px_50px_rgba(0,0,0,0.24)] min-[520px]:grid-cols-3">
                <HeroStat label="Films" value={stats.summary.totalFilms} />
                <HeroStat label="Nominations" value={stats.summary.totalNominations} highlighted />
                <HeroStat label="Wins" value={stats.summary.totalWins} />
              </div>
            )}
          </div>
        </div>

        <div
          className="h-px w-full"
          style={{ background: "linear-gradient(to right, #e8453c99 0%, rgba(212,175,55,0.45) 36%, transparent 78%)" }}
        />
      </section>

      <main className="mx-auto w-full max-w-[100vw] px-4 py-6 sm:max-w-screen-2xl sm:px-6 sm:py-8 lg:px-8 xl:px-12">
        {!stats ? (
          <div className="flex min-h-[50vh] items-center justify-center rounded-lg border border-white/10 bg-white/[0.025] p-8 text-center">
            <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.22em] text-[#8f8a9f]">
              Stats unavailable. Make sure the backend is running.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            <section className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
              <div className="grid gap-4 sm:grid-cols-3">
                <MetricCard
                  icon={<Clapperboard className="h-4 w-4" />}
                  label="Films indexed"
                  value={stats.summary.totalFilms}
                  detail="Across all award bodies"
                />
                <MetricCard
                  icon={<Award className="h-4 w-4" />}
                  label="Nominations"
                  value={stats.summary.totalNominations}
                  detail="Oscar, Golden Globe, Cannes"
                  accent="red"
                />
                <MetricCard
                  icon={<Trophy className="h-4 w-4" />}
                  label="Wins"
                  value={stats.summary.totalWins}
                  detail="Recorded award wins"
                  accent="gold"
                />
              </div>

              {stats.mostCompetitiveYear && (
                <Link
                  href={`/browse?awardYear=${stats.mostCompetitiveYear.awardYear}`}
                  className="group flex min-h-44 flex-col justify-between rounded-lg border border-[#e8453c]/25 bg-[#120c10] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.22)] transition-colors hover:border-[#e8453c]/55 hover:bg-[#171017]"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.2em] text-[#ff766d]">
                        Most contested year
                      </p>
                      <p className="mt-1 text-sm text-[#9d98ad]">Jump straight into the busiest ceremony year.</p>
                    </div>
                    <span className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/[0.045] text-[#ff766d] transition-colors group-hover:bg-[#e8453c] group-hover:text-white">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>
                  <div className="mt-6 flex items-end justify-between gap-5">
                    <p className="font-[family-name:var(--font-display)] text-6xl font-bold leading-none text-[#e8453c] sm:text-7xl">
                      {stats.mostCompetitiveYear.awardYear}
                    </p>
                    <p className="pb-2 text-right font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.16em] text-[#c8c3d8]">
                      {formatNumber(stats.mostCompetitiveYear.totalNominations)} nominations
                    </p>
                  </div>
                </Link>
              )}
            </section>

            {(stats.mostWinningFilm || stats.mostNominatedFilm) && (
              <section>
                <SectionHeader
                  eyebrow="Archive records"
                  title="Record-holding films"
                  actionHref="/browse?sort=awards"
                  actionLabel="Browse award leaders"
                />
                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  {stats.mostWinningFilm && (
                    <RecordFilmCard
                      film={stats.mostWinningFilm}
                      label="Most awarded film"
                      value={`${stats.mostWinningFilm.count} wins`}
                      accent="red"
                    />
                  )}
                  {stats.mostNominatedFilm && (
                    <RecordFilmCard
                      film={stats.mostNominatedFilm}
                      label="Most nominated film"
                      value={`${stats.mostNominatedFilm.count} nominations`}
                      accent="blue"
                    />
                  )}
                </div>
              </section>
            )}

            {(stats.mostNominatedPerson || stats.mostWinningPerson) && (
              <section className="grid gap-4 lg:grid-cols-2">
                {stats.mostNominatedPerson && (
                  <PersonRecordCard
                    label="Most nominated person"
                    person={stats.mostNominatedPerson}
                    unit="nominations"
                    accent="blue"
                  />
                )}
                {stats.mostWinningPerson && (
                  <PersonRecordCard
                    label="Most winning person"
                    person={stats.mostWinningPerson}
                    unit="wins"
                    accent="red"
                  />
                )}
              </section>
            )}

            <section className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
              {stats.awardBodyBreakdown && (
                <Panel>
                  <SectionHeader eyebrow="Dataset mix" title="Films by award body" compact />
                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/[0.055]">
                    {[
                      { key: "oscarOnly", color: "#e8453c" },
                      { key: "ggOnly", color: "#D4AF37" },
                      { key: "cannesOnly", color: "#4a9eff" },
                      { key: "berlin", color: "#a78bfa" },
                    ].map(({ key, color }) => {
                      const count = stats.awardBodyBreakdown![key as keyof typeof stats.awardBodyBreakdown] as number;
                      return (
                        <div
                          key={key}
                          className="inline-block h-full align-top"
                          style={{ width: `${(count / awardTotal) * 100}%`, backgroundColor: color }}
                        />
                      );
                    })}
                  </div>
                  <div className="mt-5 grid gap-2 sm:grid-cols-2">
                    {[
                      { label: "Oscar only", count: stats.awardBodyBreakdown.oscarOnly, color: "#e8453c", href: "/browse?awardBody=oscar" },
                      { label: "Golden Globe only", count: stats.awardBodyBreakdown.ggOnly, color: "#D4AF37", href: "/browse?awardBody=goldenglobe" },
                      { label: "Cannes only", count: stats.awardBodyBreakdown.cannesOnly, color: "#4a9eff", href: "/browse?awardBody=cannes" },
                      { label: "Berlin only", count: stats.awardBodyBreakdown.berlin, color: "#a78bfa", href: "/browse?awardBody=berlin" },
                    ].map((item) => (
                      <BreakdownLink
                        key={item.label}
                        {...item}
                        percent={(item.count / awardTotal) * 100}
                      />
                    ))}
                  </div>
                </Panel>
              )}

              {stats.decadeBreakdown.length > 0 && (
                <Panel>
                  <SectionHeader eyebrow="Coverage" title="Films by decade" compact />
                  <div className="mt-5 space-y-3">
                    {stats.decadeBreakdown.slice(-8).map((item) => (
                      <Link
                        key={item.decade}
                        href={`/browse?decadeMin=${item.decade}&decadeMax=${item.decade + 9}`}
                        className="group grid grid-cols-[52px_minmax(0,1fr)_72px] items-center gap-3"
                      >
                        <span className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.14em] text-[#a9a5bc]">
                          {item.decade}s
                        </span>
                        <span className="h-2 overflow-hidden rounded-full bg-white/[0.055]">
                          <span
                            className="block h-full rounded-full bg-[#e8453c] transition-colors group-hover:bg-[#ff625a]"
                            style={{ width: `${Math.max(5, (item.filmCount / maxDecadeFilms) * 100)}%` }}
                          />
                        </span>
                        <span className="text-right font-[family-name:var(--font-geist-mono)] text-[11px] text-[#817c91]">
                          {formatNumber(item.filmCount)}
                        </span>
                      </Link>
                    ))}
                  </div>
                </Panel>
              )}
            </section>

            {(stats.topRolledFilms.length > 0 || stats.topWatchlistedFilms.length > 0) && (
              <section>
                <SectionHeader eyebrow="CineRoll activity" title="Trending now" />
                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  {stats.topRolledFilms.length > 0 && (
                    <RankingList
                      icon={<BarChart3 className="h-4 w-4" />}
                      title="Most rolled"
                      films={stats.topRolledFilms}
                      unit="rolls"
                      accent="red"
                    />
                  )}
                  {stats.topWatchlistedFilms.length > 0 && (
                    <RankingList
                      icon={<Film className="h-4 w-4" />}
                      title="Most watchlisted"
                      films={stats.topWatchlistedFilms}
                      unit="saves"
                      accent="blue"
                    />
                  )}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function HeroStat({ label, value, highlighted = false }: { label: string; value: number; highlighted?: boolean }) {
  return (
    <div className="border-b border-white/10 p-3 last:border-b-0 min-[520px]:border-b-0 min-[520px]:border-r min-[520px]:last:border-r-0 sm:p-4">
      <p
        className={cn(
          "font-[family-name:var(--font-display)] text-2xl font-bold leading-none sm:text-3xl",
          highlighted ? "text-[#e8453c]" : "text-[#f4f0f7]",
        )}
      >
        {formatNumber(value)}
      </p>
      <p className="mt-2 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.16em] text-[#8f8a9f] sm:text-[11px]">
        {label}
      </p>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  detail,
  accent = "neutral",
}: {
  icon: ReactNode;
  label: string;
  value: number;
  detail: string;
  accent?: "neutral" | "red" | "gold";
}) {
  const iconClass = accent === "red" ? "text-[#ff766d]" : accent === "gold" ? "text-[#f2d86f]" : "text-[#b8b5c8]";

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.035] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
      <div className="flex items-center justify-between gap-4">
        <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.18em] text-[#8f8a9f]">
          {label}
        </p>
        <span className={cn("flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-white/[0.045]", iconClass)}>
          {icon}
        </span>
      </div>
      <p className="mt-5 font-[family-name:var(--font-display)] text-4xl font-bold leading-none text-[#f4f0f7]">
        {formatNumber(value)}
      </p>
      <p className="mt-2 text-sm text-[#817c91]">{detail}</p>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  actionHref,
  actionLabel,
  compact = false,
}: {
  eyebrow: string;
  title: string;
  actionHref?: string;
  actionLabel?: string;
  compact?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.22em] text-[#e8453c]">
          {eyebrow}
        </p>
        <h2 className={cn("mt-2 font-semibold tracking-normal text-[#f2eff8]", compact ? "text-xl" : "text-2xl sm:text-3xl")}>
          {title}
        </h2>
      </div>
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="inline-flex w-fit items-center gap-2 rounded-md border border-white/10 bg-white/[0.045] px-3.5 py-2 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.14em] text-[#b8b5c8] transition-colors hover:border-[#e8453c]/45 hover:text-[#ff766d]"
        >
          {actionLabel}
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

function RecordFilmCard({
  film,
  label,
  value,
  accent,
}: {
  film: FilmStat;
  label: string;
  value: string;
  accent: "red" | "blue";
}) {
  const accentClass = accent === "red" ? "text-[#ff766d]" : "text-[#78b7ff]";

  return (
    <Link
      href={`/film/${film.slug}`}
      className="group grid min-h-72 overflow-hidden rounded-lg border border-white/10 bg-white/[0.035] shadow-[0_18px_50px_rgba(0,0,0,0.2)] transition-colors hover:border-white/20 sm:grid-cols-[180px_minmax(0,1fr)]"
    >
      <div className="relative min-h-56 bg-[#11111a] sm:min-h-full">
        {film.posterUrl ? (
          <Image
            src={film.posterUrl}
            alt={`${film.title} poster`}
            fill
            sizes="(max-width: 640px) 100vw, 180px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.035]"
          />
        ) : (
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#151520,#0b0b12)]" />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(8,8,13,0.7)_100%)]" />
      </div>
      <div className="flex min-w-0 flex-col justify-between p-5 sm:p-6">
        <div>
          <div className="mb-5 flex items-center justify-between gap-4">
            <p className={cn("font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.18em]", accentClass)}>
              {label}
            </p>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.045] text-[#b8b5c8] transition-colors group-hover:border-white/20 group-hover:text-white">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
          <h3 className="line-clamp-3 font-[family-name:var(--font-display)] text-3xl font-bold leading-none text-[#f4f0f7] sm:text-4xl">
            {film.title}
          </h3>
        </div>
        <div className="mt-8 flex items-end justify-between gap-4">
          <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.16em] text-[#817c91]">
            {film.releaseYear}
          </p>
          <p className={cn("text-right font-[family-name:var(--font-display)] text-2xl font-bold leading-none", accentClass)}>
            {value}
          </p>
        </div>
      </div>
    </Link>
  );
}

function PersonRecordCard({
  label,
  person,
  unit,
  accent,
}: {
  label: string;
  person: PersonStat;
  unit: string;
  accent: "red" | "blue";
}) {
  const accentClass = accent === "red" ? "text-[#ff766d]" : "text-[#78b7ff]";

  return (
    <Link
      href={`/person/${personSlug(person.name)}`}
      className="group rounded-lg border border-white/10 bg-white/[0.035] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.18)] transition-colors hover:border-white/20 hover:bg-white/[0.05] sm:p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className={cn("flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/[0.045]", accentClass)}>
            {accent === "red" ? <Crown className="h-4 w-4" /> : <Users className="h-4 w-4" />}
          </span>
          <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.18em] text-[#8f8a9f]">
            {label}
          </p>
        </div>
        <ArrowUpRight className="h-4 w-4 text-[#777287] transition-colors group-hover:text-white" />
      </div>
      <div className="mt-8 grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <h3 className="min-w-0 font-[family-name:var(--font-display)] text-3xl font-bold leading-none text-[#f4f0f7] sm:text-4xl">
          {person.name}
        </h3>
        <div className="sm:text-right">
          <p className={cn("font-[family-name:var(--font-display)] text-5xl font-bold leading-none", accentClass)}>
            {person.count}
          </p>
          <p className="mt-1 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.16em] text-[#817c91]">
            {unit}
          </p>
        </div>
      </div>
    </Link>
  );
}

function Panel({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.035] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.18)] sm:p-6">
      {children}
    </div>
  );
}

function BreakdownLink({
  label,
  count,
  color,
  href,
  percent,
}: {
  label: string;
  count: number;
  color: string;
  href: string;
  percent: number;
}) {
  return (
    <Link
      href={href}
      className="group rounded-md border border-white/10 bg-[#0d0d15] p-4 transition-colors hover:border-white/20 hover:bg-[#12121c]"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.16em] text-[#a9a5bc]">
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
          {label}
        </span>
        <ArrowUpRight className="h-3.5 w-3.5 text-[#777287] transition-colors group-hover:text-white" />
      </div>
      <p className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold leading-none text-[#f4f0f7]">
        {formatNumber(count)}
      </p>
      <p className="mt-1 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.14em] text-[#817c91]">
        {percent.toFixed(1)}% of total
      </p>
    </Link>
  );
}

function RankingList({
  icon,
  title,
  films,
  unit,
  accent,
}: {
  icon: ReactNode;
  title: string;
  films: FilmStat[];
  unit: string;
  accent: "red" | "blue";
}) {
  const accentClass = accent === "red" ? "text-[#ff766d]" : "text-[#78b7ff]";

  return (
    <Panel>
      <div className="mb-2 flex items-center gap-3">
        <span className={cn("flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/[0.045]", accentClass)}>
          {icon}
        </span>
        <h3 className="text-xl font-semibold tracking-normal text-[#f2eff8]">{title}</h3>
      </div>
      <ol className="mt-4 divide-y divide-white/10">
        {films.slice(0, 6).map((film, index) => (
          <li key={film.id}>
            <Link
              href={`/film/${film.slug}`}
              className="group grid grid-cols-[24px_42px_minmax(0,1fr)_auto] items-center gap-3 py-3 transition-colors hover:bg-white/[0.025]"
            >
              <span className="font-[family-name:var(--font-display)] text-lg font-bold text-[#4b4658]">
                {index + 1}
              </span>
              <span className="relative h-14 overflow-hidden rounded bg-[#11111a]">
                {film.posterUrl && (
                  <Image
                    src={film.posterUrl}
                    alt={`${film.title} poster`}
                    fill
                    sizes="42px"
                    className="object-cover"
                  />
                )}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-[#eeeaf6] transition-colors group-hover:text-white">
                  {film.title}
                </span>
                <span className="mt-0.5 block font-[family-name:var(--font-geist-mono)] text-[11px] text-[#817c91]">
                  {film.releaseYear}
                </span>
              </span>
              <span className={cn("shrink-0 text-right font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.14em]", accentClass)}>
                {formatNumber(film.count)} {unit}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </Panel>
  );
}
