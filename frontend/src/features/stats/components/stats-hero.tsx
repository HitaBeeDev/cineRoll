import type { StatsResponse, StatsViewModel } from "../types";
import { CountUp } from "./count-up";
import { HeroRecordReel } from "./hero-record-reel";

type StatsHeroProps = { stats: StatsResponse; viewModel: StatsViewModel };

export function StatsHero({ stats, viewModel }: StatsHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-[#24202a] bg-[#0a0a10]">
      <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: "256px 256px" }} />
      <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 80% at 78% 10%, rgba(232,69,60,0.16), transparent 58%), linear-gradient(180deg, rgba(255,255,255,0.025), transparent 70%)" }} />
      <div className="relative mx-auto w-full max-w-full px-4 py-12 sm:max-w-screen-2xl sm:px-6 sm:py-16 lg:px-8 xl:px-12">
        <div className="grid min-w-0 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(360px,460px)]">
          <div className="min-w-0">
            <div className="mb-3 h-px w-10 bg-[#e8453c]" />
            <p className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.22em] text-[#e8453c]">The CineRoll archive</p>
            <h1 className="mt-3 max-w-3xl font-[family-name:var(--font-display)] font-bold leading-[0.95] tracking-tight text-[#f4f0f7]" style={{ fontSize: "clamp(2.5rem, 5.5vw, 5.75rem)" }}>Stats &amp; Records</h1>
            <p className="mt-5 flex flex-wrap items-baseline gap-x-2 gap-y-1 font-[family-name:var(--font-display)] text-xl font-semibold text-[#d8d4e4] sm:text-2xl"><CountUp value={stats.summary.totalFilms} className="text-[#f4f0f7]" /><span className="text-[#9e9ab0]">films.</span><CountUp value={stats.summary.totalNominations} className="text-[#f4f0f7]" /><span className="text-[#9e9ab0]">nominations.</span><CountUp value={stats.summary.totalWins} className="text-[#f4f0f7]" /><span className="text-[#9e9ab0]">wins.</span></p>
            <p className="mt-4 max-w-xl text-sm leading-7 text-[#a7a4b8] sm:text-base">Explore the films, people, decades, and award bodies that shaped cinema history — across the Oscars, Golden Globes, Cannes, and the Berlinale.</p>
          </div>
          {viewModel.reelItems.length > 0 && <HeroRecordReel items={viewModel.reelItems} />}
        </div>
      </div>
      <div className="h-px w-full" style={{ background: "linear-gradient(to right, #e8453c99 0%, rgba(212,175,55,0.45) 36%, transparent 78%)" }} />
    </section>
  );
}
