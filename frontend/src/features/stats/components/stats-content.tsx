import { buildStatsViewModel } from "../build-stats-view-model";
import type { StatsResponse } from "../types";
import { ArchivePulseSection } from "./archive-pulse-section";
import { AwardBodyPanel } from "./award-body-panel";
import { HallOfRecordsSection } from "./hall-of-records-section";
import { PatternSection } from "./pattern-section";
import { PeopleSection } from "./people-section";
import { SectionHeader } from "./section-header";
import { StatsHero } from "./stats-hero";
import { TimelineSection } from "./timeline-section";
import { TrendingSection } from "./trending-section";

type StatsContentProps = { stats: StatsResponse };

export function StatsContent({ stats }: StatsContentProps) {
  const viewModel = buildStatsViewModel(stats);
  return (
    <>
      <StatsHero stats={stats} viewModel={viewModel} />
      <main className="mx-auto w-full max-w-full space-y-16 overflow-x-hidden px-4 py-12 sm:max-w-screen-2xl sm:px-6 sm:py-16 lg:px-8 xl:px-12">
        <ArchivePulseSection viewModel={viewModel} />
        <HallOfRecordsSection stats={stats} />
        <PeopleSection stats={stats} />
        <TimelineSection viewModel={viewModel} />
        {stats.awardBodyBreakdown && (
          <section>
            <SectionHeader eyebrow="Dataset mix" title="Award body landscape" compact />
            <AwardBodyPanel breakdown={stats.awardBodyBreakdown} className="mt-5" />
          </section>
        )}
        <PatternSection viewModel={viewModel} />
        <TrendingSection stats={stats} />
      </main>
    </>
  );
}
