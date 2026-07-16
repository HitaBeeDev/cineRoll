import { AppHeader } from "@/components/app-header";
import type { FilmStat, StatsResponse } from "../types";
import { StatsContent } from "./stats-content";
import { StatsStructuredData } from "./stats-structured-data";
import { StatsUnavailable } from "./stats-unavailable";

type StatsPageShellProps = { stats: StatsResponse | null; battleLeaderboard: FilmStat[] };

export function StatsPageShell({ stats, battleLeaderboard }: StatsPageShellProps) {
  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#08080d] text-[#F5F5F0]">
      <StatsStructuredData />
      <AppHeader />
      {stats ? <StatsContent stats={stats} battleLeaderboard={battleLeaderboard} /> : <StatsUnavailable />}
    </div>
  );
}
