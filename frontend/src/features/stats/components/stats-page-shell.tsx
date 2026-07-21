import { AppHeader } from "@/components/app-header";
import type { StatsResponse } from "../types";
import { StatsContent } from "./stats-content";
import { StatsStructuredData } from "./stats-structured-data";
import { StatsUnavailable } from "./stats-unavailable";

type StatsPageShellProps = { stats: StatsResponse | null };

export function StatsPageShell({ stats }: StatsPageShellProps) {
  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#08080d] text-[#F5F5F0]">
      <StatsStructuredData />
      <AppHeader />
      {stats ? <StatsContent stats={stats} /> : <StatsUnavailable />}
    </div>
  );
}
