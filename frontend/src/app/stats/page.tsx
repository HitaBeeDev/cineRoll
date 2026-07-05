import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight, BarChart3, Crown, Film, Sparkles, Users } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import {
  CountUp,
  DecadeTimeline,
  HeroRecordReel,
  type DecadeDatum,
  type ReelItem,
} from "@/components/stats/stats-interactive";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Award Film Stats & Records",
  description:
    "Discover the most nominated and award-winning films and people across the Oscars, Golden Globes, Cannes, and the Berlinale. Explore CineRoll's full award film dataset by the numbers.",
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
type DecadeStat = {
  decade: number;
  filmCount: number;
  avgNominations: number;
  topFilm: { title: string; slug: string; count: number } | null;
};
type StatsResponse = {
  summary: { totalFilms: number; totalNominations: number; totalWins: number };
  topNominatedPeople: PersonStat[];
  topWinningPeople: PersonStat[];
  topNominatedFilms: FilmStat[];
  topWinningFilms: FilmStat[];
  mostCompetitiveYear: { awardYear: number; totalNominations: number } | null;
  decadeBreakdown: DecadeStat[];
  awardBodyBreakdown: {
    coverage: { oscar: number; goldenGlobe: number; cannes: number; berlin: number };
    composition: {
      oscarOnly: number;
      goldenGlobeOnly: number;
      cannesOnly: number;
      berlinOnly: number;
      multiple: number;
    };
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

// Head-to-head Elo leaderboard from Roll Battle. Mapped into FilmStat (count =
// Elo rating) so it reuses the existing record-group UI. Best-effort — an empty
// list just hides the section.
async function fetchBattleLeaderboard(): Promise<FilmStat[]> {
  try {
    const res = await fetch(`${API_URL}/api/roll-battle/leaderboard?limit=7`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = (await res.json()) as {
      films: Array<{
        id: string;
        slug: string;
        title: string;
        releaseYear: number;
        posterUrl: string | null;
        rating: number;
      }>;
    };
    return data.films.map((film) => ({
      id: film.id,
      slug: film.slug,
      title: film.title,
      releaseYear: film.releaseYear,
      posterUrl: film.posterUrl,
      count: film.rating,
    }));
  } catch {
    return [];
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

type Insight = { title: string; body: string };

function buildInsights(stats: StatsResponse): Insight[] {
  const out: Insight[] = [];
  const { summary, decadeBreakdown, awardBodyBreakdown, topWinningFilms } = stats;

  if (decadeBreakdown.length > 0) {
    const peak = decadeBreakdown.reduce((a, b) => (b.filmCount > a.filmCount ? b : a));
    out.push({
      title: `The ${peak.decade}s are the densest era`,
      body: `${formatNumber(peak.filmCount)} films land in the ${peak.decade}s — more than any other decade in the archive.`,
    });
  }

  if (awardBodyBreakdown && awardBodyBreakdown.total > 0) {
    const { multiple } = awardBodyBreakdown.composition;
    const pct = Math.round((multiple / awardBodyBreakdown.total) * 100);
    out.push({
      title: `${pct}% of films cross award bodies`,
      body: `${formatNumber(multiple)} films were honored by more than one of the Oscars, Golden Globes, Cannes, or Berlinale.`,
    });
  }

  if (summary.totalNominations > 0) {
    const wr = ((summary.totalWins / summary.totalNominations) * 100).toFixed(1);
    out.push({
      title: `Only ${wr}% of nominations become wins`,
      body: `Across ${formatNumber(summary.totalNominations)} nominations, the archive records just ${formatNumber(summary.totalWins)} wins.`,
    });
  }

  if (topWinningFilms[0]) {
    const f = topWinningFilms[0];
    out.push({
      title: `${f.title} tops every win count`,
      body: `${f.title} (${f.releaseYear}) holds the archive record with ${f.count} wins.`,
    });
  }

  return out.slice(0, 4);
}

export default async function StatsPage() {
  const [stats, battleLeaderboard] = await Promise.all([fetchStats(), fetchBattleLeaderboard()]);

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
        "Statistics about Oscar, Golden Globe, Cannes, and Berlinale-nominated and winning films.",
    },
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#08080d] text-[#F5F5F0]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <AppHeader />

      {!stats ? (
        <main className="mx-auto w-full max-w-screen-2xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex min-h-[50vh] items-center justify-center rounded-lg border border-white/10 bg-white/[0.025] p-8 text-center">
            <p className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.22em] text-[#9e9ab0]">
              Stats unavailable. Make sure the backend is running.
            </p>
          </div>
        </main>
      ) : (
        <StatsContent stats={stats} battleLeaderboard={battleLeaderboard} />
      )}
    </div>
  );
}

function StatsContent({
  stats,
  battleLeaderboard,
}: {
  stats: StatsResponse;
  battleLeaderboard: FilmStat[];
}) {
  const { summary } = stats;
  const winRate =
    summary.totalNominations > 0 ? (summary.totalWins / summary.totalNominations) * 100 : 0;
  const avgNomsPerFilm =
    summary.totalFilms > 0 ? summary.totalNominations / summary.totalFilms : 0;
  const decadesSorted = [...stats.decadeBreakdown].map((d) => d.decade).sort((a, b) => a - b);
  const decadeSpan =
    decadesSorted.length > 0
      ? `${decadesSorted[0]}s – ${decadesSorted[decadesSorted.length - 1]}s`
      : "—";

  const reelItems: ReelItem[] = [];
  if (stats.mostCompetitiveYear) {
    reelItems.push({
      eyebrow: "Most competitive year",
      title: `${stats.mostCompetitiveYear.awardYear}`,
      value: formatNumber(stats.mostCompetitiveYear.totalNominations),
      sub: "nominations",
      href: `#decade-${Math.floor(stats.mostCompetitiveYear.awardYear / 10) * 10}`,
      accent: "red",
    });
  }
  if (stats.topWinningFilms[0]) {
    const f = stats.topWinningFilms[0];
    reelItems.push({
      eyebrow: "Most awarded film",
      title: f.title,
      value: `${f.count}`,
      sub: "wins",
      href: `/film/${f.slug}`,
      accent: "red",
    });
  }
  if (stats.topNominatedFilms[0]) {
    const f = stats.topNominatedFilms[0];
    reelItems.push({
      eyebrow: "Most nominated film",
      title: f.title,
      value: `${f.count}`,
      sub: "nominations",
      href: `/film/${f.slug}`,
      accent: "blue",
    });
  }
  if (stats.topNominatedPeople[0]) {
    const p = stats.topNominatedPeople[0];
    reelItems.push({
      eyebrow: "Most nominated person",
      title: p.name,
      value: `${p.count}`,
      sub: "nominations",
      href: `/person/${personSlug(p.name)}`,
      accent: "blue",
    });
  }

  const peakDecade =
    stats.decadeBreakdown.length > 0
      ? stats.decadeBreakdown.reduce((a, b) => (b.filmCount > a.filmCount ? b : a)).decade
      : 0;
  const decadeData: DecadeDatum[] = stats.decadeBreakdown.map((d) => ({
    decade: d.decade,
    filmCount: d.filmCount,
    avgNominations: d.avgNominations,
    topFilm: d.topFilm,
    href: `/browse?decadeMin=${d.decade}&decadeMax=${d.decade + 9}`,
  }));

  const insights = buildInsights(stats);

  // Context for the Archive Pulse numbers — a stat means more next to a baseline.
  const decadeAvgValues = stats.decadeBreakdown.map((d) => d.avgNominations).filter((v) => v > 0);
  const densestDecade =
    stats.decadeBreakdown.length > 0
      ? stats.decadeBreakdown.reduce((a, b) => (b.avgNominations > a.avgNominations ? b : a))
      : null;
  const winRateContext =
    winRate > 0 ? `About 1 in ${(100 / winRate).toFixed(1)} nominations` : "No nominations recorded";
  const densityContext =
    decadeAvgValues.length > 0 && densestDecade
      ? `Peaks at ${Math.max(...decadeAvgValues).toFixed(1)} in the ${densestDecade.decade}s`
      : "Average nominations per film";

  // Editorial closer — a sharp lead line over short, staccato findings.
  const conclusionPoints =
    peakDecade > 0
      ? [
          `The ${peakDecade}s dominate the dataset.`,
          `The Oscars shape the leaderboard.`,
          `And only ${winRate.toFixed(0)}% of nominations ever become wins.`,
        ]
      : [];

  return (
    <>
      {/* ---------------------------------------------------------------- */}
      {/* HERO — archive command center                                    */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative overflow-hidden border-b border-[#24202a] bg-[#0a0a10]">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "256px 256px",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 80% at 78% 10%, rgba(232,69,60,0.16), transparent 58%), linear-gradient(180deg, rgba(255,255,255,0.025), transparent 70%)",
          }}
        />

        <div className="relative mx-auto w-full max-w-full px-4 py-12 sm:max-w-screen-2xl sm:px-6 sm:py-16 lg:px-8 xl:px-12">
          <div className="grid min-w-0 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(360px,460px)]">
            <div className="min-w-0">
              <div className="mb-3 h-px w-10 bg-[#e8453c]" />
              <p className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.22em] text-[#e8453c]">
                The CineRoll archive
              </p>
              <h1
                className="mt-3 max-w-3xl font-[family-name:var(--font-display)] font-bold leading-[0.95] tracking-tight text-[#f4f0f7]"
                style={{ fontSize: "clamp(2.5rem, 5.5vw, 5.75rem)" }}
              >
                Stats &amp; Records
              </h1>
              <p className="mt-5 flex flex-wrap items-baseline gap-x-2 gap-y-1 font-[family-name:var(--font-display)] text-xl font-semibold text-[#d8d4e4] sm:text-2xl">
                <CountUp value={summary.totalFilms} className="text-[#f4f0f7]" />
                <span className="text-[#9e9ab0]">films.</span>
                <CountUp value={summary.totalNominations} className="text-[#f4f0f7]" />
                <span className="text-[#9e9ab0]">nominations.</span>
                <CountUp value={summary.totalWins} className="text-[#f4f0f7]" />
                <span className="text-[#9e9ab0]">wins.</span>
              </p>
              <p className="mt-4 max-w-xl text-sm leading-7 text-[#a7a4b8] sm:text-base">
                Explore the films, people, decades, and award bodies that shaped cinema history —
                across the Oscars, Golden Globes, Cannes, and the Berlinale.
              </p>
            </div>

            {reelItems.length > 0 && <HeroRecordReel items={reelItems} />}
          </div>
        </div>

        <div
          className="h-px w-full"
          style={{
            background:
              "linear-gradient(to right, #e8453c99 0%, rgba(212,175,55,0.45) 36%, transparent 78%)",
          }}
        />
      </section>

      <main className="mx-auto w-full max-w-full space-y-16 overflow-x-hidden px-4 py-12 sm:max-w-screen-2xl sm:px-6 sm:py-16 lg:px-8 xl:px-12">
        {/* ARCHIVE PULSE — compact metric strip, each with its own visual */}
        <section>
          <SectionHeader eyebrow="Archive pulse" title="The shape of the archive" compact />
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <PulseCard
              label="Win conversion"
              detail="Nominations that became wins"
              context={winRateContext}
              value={<CountUp value={winRate} decimals={1} suffix="%" />}
              visual={<WinRateRing percent={winRate} />}
            />
            <PulseCard
              label="Nomination density"
              detail="Average nominations per film"
              context={densityContext}
              value={<CountUp value={avgNomsPerFilm} decimals={1} />}
              visual={<DensityBars value={avgNomsPerFilm} max={5} />}
            />
            <PulseCard
              label="Decades covered"
              detail="Continuous span of award history"
              context={decadeSpan}
              value={<CountUp value={decadesSorted.length} />}
              visual={<DecadeTicks covered={decadesSorted} />}
            />
          </div>
        </section>

        {/* HALL OF RECORDS — the dramatic centerpiece */}
        {(stats.topWinningFilms.length > 0 || stats.topNominatedFilms.length > 0) && (
          <section>
            <SectionHeader
              eyebrow="Archive records"
              title="Hall of Records"
              description="The films and people that dominate the archive."
              actionHref="/browse?sort=awards"
              actionLabel="Enter the leaderboard"
            />
            <div className="mt-6 grid gap-6 xl:grid-cols-2">
              {stats.topWinningFilms.length > 0 && (
                <FilmRecordGroup
                  heading="Most awarded films"
                  films={stats.topWinningFilms}
                  unit="wins"
                  accent="red"
                />
              )}
              {stats.topNominatedFilms.length > 0 && (
                <FilmRecordGroup
                  heading="Most nominated films"
                  films={stats.topNominatedFilms}
                  unit="nominations"
                  accent="blue"
                />
              )}
            </div>
          </section>
        )}

        {/* HEAD-TO-HEAD — Roll Battle Elo leaderboard */}
        {battleLeaderboard.length > 0 && (
          <section>
            <SectionHeader
              eyebrow="Roll Battle"
              title="Head-to-head champions"
              description="Ranked by an Elo rating earned from every Versus duel players vote on — not awards, but which film wins the room."
              actionHref="/roll-battle"
              actionLabel="Enter the arena"
            />
            <div className="mt-6">
              <FilmRecordGroup
                heading="Highest Elo in head-to-head play"
                films={battleLeaderboard}
                unit="Elo"
                accent="red"
              />
            </div>
          </section>
        )}

        {/* THE PEOPLE — person podiums */}
        {(stats.topNominatedPeople.length > 0 || stats.topWinningPeople.length > 0) && (
          <section>
            <SectionHeader eyebrow="Behind the records" title="The people" compact />
            <div className="mt-6 grid min-w-0 gap-6 lg:grid-cols-2">
              {stats.topWinningPeople.length > 0 && (
                <PersonRecordGroup
                  heading="Most winning"
                  icon={<Crown className="h-4 w-4" />}
                  people={stats.topWinningPeople}
                  unit="wins"
                  accent="red"
                />
              )}
              {stats.topNominatedPeople.length > 0 && (
                <PersonRecordGroup
                  heading="Most nominated"
                  icon={<Users className="h-4 w-4" />}
                  people={stats.topNominatedPeople}
                  unit="nominations"
                  accent="blue"
                />
              )}
            </div>
          </section>
        )}

        {/* TIMELINE OF CINEMA — the dominant, interactive centerpiece */}
        {decadeData.length > 0 && (
          <section className="scroll-mt-24">
            <SectionHeader
              eyebrow="The timeline"
              title="The archive through time"
              description="Each bar is a decade by film count — it opens on the densest era. Select any decade to explore its share, density, and defining film."
              actionHref="/browse?sort=year"
              actionLabel="Browse by year"
            />
            <div className="relative mt-6 overflow-hidden rounded-2xl border border-white/12 bg-[#0a0a12] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.45)] sm:p-8">
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse 60% 90% at 85% 0%, rgba(232,69,60,0.12), transparent 60%)",
                }}
              />
              <div className="relative">
                <DecadeTimeline decades={decadeData} peakDecade={peakDecade} />
              </div>
            </div>
          </section>
        )}

        {/* AWARD BODY LANDSCAPE */}
        {stats.awardBodyBreakdown && (
          <section>
            <SectionHeader eyebrow="Dataset mix" title="Award body landscape" compact />
            <AwardBodyPanel breakdown={stats.awardBodyBreakdown} className="mt-5" />
          </section>
        )}

        {/* THE PATTERN — editorial conclusion */}
        {conclusionPoints.length > 0 && (
          <section className="border-t border-white/10 pt-12">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12">
              <div>
                <div className="flex items-center gap-2 font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.22em] text-[#e8453c]">
                  <Sparkles className="h-3.5 w-3.5" />
                  The pattern
                </div>
                <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold leading-[1.1] text-[#f4f0f7] sm:text-[2.75rem]">
                  The archive is not evenly distributed.
                </h2>
                <p className="mt-4 font-[family-name:var(--font-display)] text-xl leading-relaxed text-[#b6b2c6] sm:text-2xl">
                  {conclusionPoints.join(" ")}
                </p>
              </div>

              {insights.length > 0 && (
                <ol className="flex flex-col justify-center divide-y divide-white/10">
                  {insights.map((insight, i) => (
                    <li key={insight.title} className="flex gap-5 py-4 first:pt-0 last:pb-0">
                      <span className="font-[family-name:var(--font-display)] text-2xl font-bold tabular-nums text-[#4b4658]">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <h3 className="font-[family-name:var(--font-display)] text-lg font-bold leading-tight text-[#f4f0f7]">
                          {insight.title}
                        </h3>
                        <p className="mt-1 text-sm leading-6 text-[#b6b2c6]">{insight.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </section>
        )}

        {/* TRENDING — live CineRoll activity */}
        {(stats.topRolledFilms.length > 0 || stats.topWatchlistedFilms.length > 0) && (
          <section>
            <SectionHeader eyebrow="CineRoll activity" title="Trending now" compact />
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
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
      </main>
    </>
  );
}

/* ================================================================== */
/* Presentational helpers (server-rendered)                            */
/* ================================================================== */

function SectionHeader({
  eyebrow,
  title,
  description,
  actionHref,
  actionLabel,
  compact = false,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
  compact?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.22em] text-[#e8453c]">
          {eyebrow}
        </p>
        <h2
          className={cn(
            "mt-2 font-[family-name:var(--font-display)] font-bold tracking-tight text-[#f2eff8]",
            compact ? "text-2xl" : "text-3xl sm:text-4xl",
          )}
        >
          {title}
        </h2>
        {description && <p className="mt-2 max-w-xl text-sm text-[#9e9ab0]">{description}</p>}
      </div>
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="inline-flex w-fit items-center gap-2 rounded-md border border-white/10 bg-white/[0.045] px-3.5 py-2 font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.14em] text-[#c4c1d2] transition-colors hover:border-[#e8453c]/45 hover:text-[#ff766d]"
        >
          {actionLabel}
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

function Panel({ children, className }: { children: ReactNode; className?: string | undefined }) {
  return (
    <div
      className={cn(
        "rounded-lg border border-white/10 bg-white/[0.035] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.18)] sm:p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ---- Archive pulse visuals ---- */

function PulseCard({
  label,
  detail,
  context,
  value,
  visual,
}: {
  label: string;
  detail: string;
  context: string;
  value: ReactNode;
  visual: ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-center gap-4 rounded-lg border border-white/10 bg-white/[0.035] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.18)] sm:gap-5 sm:p-5">
      <div className="shrink-0">{visual}</div>
      <div className="min-w-0">
        <p className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.18em] text-[#b6b2c6]">
          {label}
        </p>
        <p className="mt-2 font-[family-name:var(--font-display)] text-4xl font-bold leading-none text-[#f4f0f7]">
          {value}
        </p>
        <p className="mt-2 text-sm text-[#c4c1d2]">{detail}</p>
        <p className="mt-1 font-[family-name:var(--font-geist-mono)] text-xs tracking-[0.02em] text-[#ff8a83]">
          {context}
        </p>
      </div>
    </div>
  );
}

function WinRateRing({ percent }: { percent: number }) {
  const r = 26;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - Math.min(100, Math.max(0, percent)) / 100);
  return (
    <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90" aria-hidden="true">
      <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
      <circle
        cx="32"
        cy="32"
        r={r}
        fill="none"
        stroke="#e8453c"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
      />
    </svg>
  );
}

function DensityBars({ value, max }: { value: number; max: number }) {
  const bars = 8;
  const lit = Math.round((Math.min(value, max) / max) * bars);
  return (
    <div className="flex h-16 w-16 items-end gap-1" aria-hidden="true">
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className="flex-1 rounded-sm"
          style={{
            height: `${30 + (i / (bars - 1)) * 70}%`,
            backgroundColor: i < lit ? "#e8453c" : "rgba(255,255,255,0.08)",
          }}
        />
      ))}
    </div>
  );
}

function DecadeTicks({ covered }: { covered: number[] }) {
  const all = [1920, 1930, 1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020];
  const set = new Set(covered);
  return (
    <div className="flex h-16 w-16 flex-col justify-center gap-1.5" aria-hidden="true">
      <div className="flex items-center gap-[3px]">
        {all.map((decade) => (
          <span
            key={decade}
            className="h-6 flex-1 rounded-sm"
            style={{ backgroundColor: set.has(decade) ? "#e8453c" : "rgba(255,255,255,0.08)" }}
          />
        ))}
      </div>
    </div>
  );
}

/* ---- Hall of Records ---- */

function FilmRecordGroup({
  heading,
  films,
  unit,
  accent,
}: {
  heading: string;
  films: FilmStat[];
  unit: string;
  accent: "red" | "blue";
}) {
  const [first, ...rest] = films;
  return (
    <div>
      <h3 className="mb-3 font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.2em] text-[#c4c1d2]">
        {heading}
      </h3>
      {first && <FeaturedFilmCard film={first} rank={1} unit={unit} accent={accent} />}
      {rest.length > 0 && (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {rest.map((film, i) => (
            <RunnerUpFilmCard
              key={film.id}
              film={film}
              rank={i + 2}
              unit={unit}
              accent={accent}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FeaturedFilmCard({
  film,
  rank,
  unit,
  accent,
}: {
  film: FilmStat;
  rank: number;
  unit: string;
  accent: "red" | "blue";
}) {
  const accentClass = accent === "red" ? "text-[#ff766d]" : "text-[#78b7ff]";
  const glow = accent === "red" ? "rgba(232,69,60,0.22)" : "rgba(74,158,255,0.20)";
  return (
    <Link
      href={`/film/${film.slug}`}
      className="group relative grid overflow-hidden rounded-2xl border border-white/12 bg-white/[0.04] shadow-[0_28px_80px_rgba(0,0,0,0.4)] transition-colors hover:border-white/30 sm:grid-cols-[210px_minmax(0,1fr)]"
    >
      <div className="relative min-h-72 bg-[#11111a] sm:min-h-full">
        {film.posterUrl ? (
          <Image
            src={film.posterUrl}
            alt={`${film.title} poster`}
            fill
            sizes="(max-width: 640px) 100vw, 210px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#151520,#0b0b12)]" />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(8,8,13,0.7)_100%)]" />
        <span className="absolute left-3 top-3 flex h-9 items-center gap-1.5 rounded-md border border-white/15 bg-black/55 px-2.5 font-[family-name:var(--font-geist-mono)] text-xs font-bold uppercase tracking-[0.12em] text-white backdrop-blur-sm">
          № {rank}
        </span>
      </div>
      <div className="relative flex min-w-0 flex-col justify-between p-6 sm:p-7">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: `radial-gradient(ellipse 70% 60% at 100% 100%, ${glow}, transparent 62%)` }}
        />
        <div className="relative flex items-start justify-between gap-3">
          <span className={cn("font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.2em]", accentClass)}>
            Record holder
          </span>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.045] text-[#c4c1d2] transition-colors group-hover:bg-white/[0.1] group-hover:text-white">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
        <h4 className="relative mt-5 line-clamp-3 font-[family-name:var(--font-display)] text-3xl font-bold leading-[1.02] text-[#f4f0f7] sm:text-4xl">
          {film.title}
        </h4>
        <div className="relative mt-6 flex items-end justify-between gap-4">
          <p className="pb-2 font-[family-name:var(--font-geist-mono)] text-sm uppercase tracking-[0.16em] text-[#b6b2c6]">
            {film.releaseYear}
          </p>
          <p className="text-right leading-[0.8]">
            <span className={cn("font-[family-name:var(--font-display)] text-6xl font-bold sm:text-7xl", accentClass)}>
              {film.count}
            </span>
            <span className="mt-1 block font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.18em] text-[#b6b2c6]">
              {unit}
            </span>
          </p>
        </div>
      </div>
    </Link>
  );
}

function RunnerUpFilmCard({
  film,
  rank,
  unit,
  accent,
}: {
  film: FilmStat;
  rank: number;
  unit: string;
  accent: "red" | "blue";
}) {
  const accentClass = accent === "red" ? "text-[#ff766d]" : "text-[#78b7ff]";
  return (
    <Link
      href={`/film/${film.slug}`}
      className="group flex min-w-0 gap-3 rounded-lg border border-white/10 bg-white/[0.025] p-3 transition-colors hover:border-white/20 hover:bg-white/[0.04]"
    >
      <div className="relative h-20 w-[54px] shrink-0 overflow-hidden rounded bg-[#11111a]">
        {film.posterUrl && (
          <Image
            src={film.posterUrl}
            alt={`${film.title} poster`}
            fill
            sizes="54px"
            className="object-cover"
          />
        )}
        <span className="absolute left-1 top-1 flex h-5 w-5 items-center justify-center rounded border border-white/15 bg-black/60 font-[family-name:var(--font-display)] text-xs font-bold text-white">
          {rank}
        </span>
      </div>
      <div className="flex min-w-0 flex-col justify-between py-0.5">
        <p className="line-clamp-2 text-sm font-semibold leading-snug text-[#eeeaf6] transition-colors group-hover:text-white">
          {film.title}
        </p>
        <p className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.12em] text-[#9e9ab0]">
          {film.releaseYear}
          <span className="mx-1.5 text-white/15">·</span>
          <span className={accentClass}>
            {film.count} {unit}
          </span>
        </p>
      </div>
    </Link>
  );
}

/* ---- People records ---- */

function PersonRecordGroup({
  heading,
  icon,
  people,
  unit,
  accent,
}: {
  heading: string;
  icon: ReactNode;
  people: PersonStat[];
  unit: string;
  accent: "red" | "blue";
}) {
  const accentColor = accent === "red" ? "#ff766d" : "#78b7ff";
  const max = Math.max(...people.map((p) => p.count), 1);

  return (
    <Panel className="min-w-0 overflow-hidden">
      <div className="mb-5 flex items-center gap-3">
        <span
          className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/[0.045]"
          style={{ color: accentColor }}
        >
          {icon}
        </span>
        <h3 className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.2em] text-[#c4c1d2]">
          {heading}
        </h3>
      </div>

      <ol className="space-y-4">
        {people.map((person, i) => {
          const isFirst = i === 0;
          return (
            <li key={person.name}>
              <Link href={`/person/${personSlug(person.name)}`} className="group block">
                <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                  <span className="flex min-w-0 items-baseline gap-2 sm:gap-3">
                    <span
                      className={cn(
                        "font-[family-name:var(--font-display)] font-bold tabular-nums text-[#4b4658]",
                        isFirst ? "text-lg sm:text-xl" : "text-base",
                      )}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={cn(
                        "truncate font-[family-name:var(--font-display)] font-bold text-[#f4f0f7] transition-colors group-hover:text-white",
                        isFirst ? "text-xl sm:text-3xl" : "text-lg",
                      )}
                    >
                      {person.name}
                    </span>
                  </span>
                  <span className="shrink-0 pl-8 leading-none sm:pl-0 sm:text-right">
                    <span
                      className={cn("font-[family-name:var(--font-display)] font-bold", isFirst ? "text-2xl sm:text-4xl" : "text-xl")}
                      style={{ color: accentColor }}
                    >
                      {person.count}
                    </span>
                    <span className="ml-1.5 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.1em] text-[#9e9ab0] sm:text-xs sm:tracking-[0.14em]">
                      {unit}
                    </span>
                  </span>
                </div>
                <div className={cn("mt-2 overflow-hidden rounded-full bg-white/[0.06]", isFirst ? "h-2" : "h-1.5")}>
                  <div
                    className="h-full rounded-full transition-[width] duration-500"
                    style={{
                      width: `${Math.max(6, (person.count / max) * 100)}%`,
                      backgroundColor: accentColor,
                      opacity: isFirst ? 1 : 0.55,
                    }}
                  />
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    </Panel>
  );
}

/* ---- Award body landscape ---- */

function AwardBodyPanel({
  breakdown,
  className,
}: {
  breakdown: NonNullable<StatsResponse["awardBodyBreakdown"]>;
  className?: string;
}) {
  const total = breakdown.total || 1;
  const pct = (count: number) => (count / total) * 100;

  const composition = [
    { label: "Oscar only", count: breakdown.composition.oscarOnly, color: "#e8453c" },
    { label: "Golden Globe only", count: breakdown.composition.goldenGlobeOnly, color: "#D4AF37" },
    { label: "Cannes only", count: breakdown.composition.cannesOnly, color: "#4a9eff" },
    { label: "Berlinale only", count: breakdown.composition.berlinOnly, color: "#a78bfa" },
    { label: "Multiple bodies", count: breakdown.composition.multiple, color: "#8a8597" },
  ].filter((segment) => segment.count > 0);

  const coverage = [
    { label: "Oscars", count: breakdown.coverage.oscar, color: "#e8453c", href: "/browse?awardBody=oscar" },
    { label: "Golden Globe", count: breakdown.coverage.goldenGlobe, color: "#D4AF37", href: "/browse?awardBody=goldenglobe" },
    { label: "Cannes", count: breakdown.coverage.cannes, color: "#4a9eff", href: "/browse?awardBody=cannes" },
    { label: "Berlinale", count: breakdown.coverage.berlin, color: "#a78bfa", href: "/browse?awardBody=berlin" },
  ].filter((item) => item.count > 0);

  return (
    <Panel className={className}>
      {/* Part 1 — exclusive overlap composition (sums to 100%) */}
      <h3 className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.18em] text-[#c4c1d2]">
        Distribution by award-body overlap
      </h3>
      <p className="mt-1 text-sm text-[#9e9ab0]">
        Every film in one bucket — its sole body, or “multiple” if more than one honored it.
      </p>
      <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-white/[0.055]">
        {composition.map((segment) => (
          <div
            key={segment.label}
            className="h-full"
            style={{ width: `${pct(segment.count)}%`, backgroundColor: segment.color }}
          />
        ))}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
        {composition.map((segment) => (
          <li
            key={segment.label}
            className="flex items-center gap-2 font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.1em] text-[#b6b2c6]"
          >
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: segment.color }} />
            {segment.label}
            <span className="text-[#9e9ab0]">{pct(segment.count).toFixed(1)}%</span>
          </li>
        ))}
      </ul>

      {/* Part 2 — coverage per body (overlapping shares) */}
      <div className="mt-7 border-t border-white/10 pt-6">
        <h3 className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.18em] text-[#c4c1d2]">
          Coverage by individual award body
        </h3>
        <p className="mt-1 text-sm text-[#9e9ab0]">
          A film counts under every body that honored it, so these shares overlap.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {coverage.map((item) => (
            <BreakdownLink key={item.label} {...item} percent={pct(item.count)} />
          ))}
        </div>
      </div>
    </Panel>
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
        <span className="flex items-center gap-2 font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.16em] text-[#a9a5bc]">
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
          {label}
        </span>
        <ArrowUpRight className="h-3.5 w-3.5 text-[#777287] transition-colors group-hover:text-white" />
      </div>
      <p className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold leading-none text-[#f4f0f7]">
        {formatNumber(count)}
      </p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full"
          style={{ width: `${Math.max(2, Math.min(100, percent))}%`, backgroundColor: color }}
        />
      </div>
      <p className="mt-2 font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.14em] text-[#9e9ab0]">
        {percent.toFixed(1)}% of catalog
      </p>
    </Link>
  );
}

/* ---- Trending ---- */

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
    <Panel className="min-w-0 overflow-hidden">
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
              className="group grid min-w-0 grid-cols-[24px_42px_minmax(0,1fr)] items-center gap-3 py-3 transition-colors hover:bg-white/[0.025] sm:grid-cols-[24px_42px_minmax(0,1fr)_auto]"
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
                <span className="mt-0.5 block font-[family-name:var(--font-geist-mono)] text-xs text-[#9e9ab0]">
                  {film.releaseYear}
                </span>
              </span>
              <span className={cn("col-start-3 -mt-2 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.1em] sm:col-start-auto sm:mt-0 sm:shrink-0 sm:text-right sm:text-xs sm:tracking-[0.14em]", accentClass)}>
                {formatNumber(film.count)} {unit}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </Panel>
  );
}
