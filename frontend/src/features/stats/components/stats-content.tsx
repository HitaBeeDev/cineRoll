import { buildStatsViewModel } from "../build-stats-view-model";
import type { FilmStat, StatsResponse } from "../types";
import { ArchivePulseSection } from "./archive-pulse-section";
import { AwardBodySection } from "./award-body-section";
import { BattleLeaderboardSection } from "./battle-leaderboard-section";
import { HallOfRecordsSection } from "./hall-of-records-section";
import { PatternSection } from "./pattern-section";
import { PeopleSection } from "./people-section";
import { StatsHero } from "./stats-hero";
import { TimelineSection } from "./timeline-section";
import { TrendingSection } from "./trending-section";

type StatsContentProps = { stats: StatsResponse; battleLeaderboard: FilmStat[] };

export function StatsContent({ stats, battleLeaderboard }: StatsContentProps) {
  const viewModel = buildStatsViewModel(stats);
  return (
    <>
      <StatsHero stats={stats} viewModel={viewModel} />
      <main className="mx-auto w-full max-w-full space-y-16 overflow-x-hidden px-4 py-12 sm:max-w-screen-2xl sm:px-6 sm:py-16 lg:px-8 xl:px-12">
        <ArchivePulseSection viewModel={viewModel} />
        <HallOfRecordsSection stats={stats} />
        <BattleLeaderboardSection films={battleLeaderboard} />
        <PeopleSection stats={stats} />
        <TimelineSection viewModel={viewModel} />
        <AwardBodySection breakdown={stats.awardBodyBreakdown} />
        <PatternSection viewModel={viewModel} />
        <TrendingSection stats={stats} />
      </main>
    </>
  );
}
