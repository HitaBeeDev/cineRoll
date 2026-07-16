import type { StatsViewModel } from "../types";
import { CountUp } from "./count-up";
import { DecadeTicks } from "./decade-ticks";
import { DensityBars } from "./density-bars";
import { PulseCard } from "./pulse-card";
import { SectionHeader } from "./section-header";
import { WinRateRing } from "./win-rate-ring";

export function ArchivePulseSection({ viewModel }: { viewModel: StatsViewModel }) {
  return (
    <section>
      <SectionHeader eyebrow="Archive pulse" title="The shape of the archive" compact />
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <PulseCard label="Win conversion" detail="Nominations that became wins" context={viewModel.winRateContext} value={<CountUp value={viewModel.winRate} decimals={1} suffix="%" />} visual={<WinRateRing percent={viewModel.winRate} />} />
        <PulseCard label="Nomination density" detail="Average nominations per film" context={viewModel.densityContext} value={<CountUp value={viewModel.avgNominationsPerFilm} decimals={1} />} visual={<DensityBars value={viewModel.avgNominationsPerFilm} max={5} />} />
        <PulseCard label="Decades covered" detail="Continuous span of award history" context={viewModel.decadeSpan} value={<CountUp value={viewModel.decadesSorted.length} />} visual={<DecadeTicks covered={viewModel.decadesSorted} />} />
      </div>
    </section>
  );
}
