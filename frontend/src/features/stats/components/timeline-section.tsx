import type { StatsViewModel } from "../types";
import { DecadeTimeline } from "./decade-timeline";
import { SectionHeader } from "./section-header";

export function TimelineSection({ viewModel }: { viewModel: StatsViewModel }) {
  if (viewModel.decadeData.length === 0) return null;
  return (
    <section className="scroll-mt-24">
      <SectionHeader eyebrow="The timeline" title="The archive through time" description="Each bar is a decade by film count — it opens on the densest era. Select any decade to explore its share, density, and defining film." actionHref="/browse?sort=year" actionLabel="Browse by year" />
      <div className="relative mt-6 overflow-hidden rounded-2xl border border-white/12 bg-[#0a0a12] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.45)] sm:p-8">
        <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 90% at 85% 0%, rgba(232,69,60,0.12), transparent 60%)" }} />
        <div className="relative"><DecadeTimeline decades={viewModel.decadeData} peakDecade={viewModel.peakDecade} /></div>
      </div>
    </section>
  );
}
