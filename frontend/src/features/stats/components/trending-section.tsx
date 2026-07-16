import { BarChart3, Film } from "lucide-react";
import type { StatsResponse } from "../types";
import { RankingList } from "./ranking-list";
import { SectionHeader } from "./section-header";

export function TrendingSection({ stats }: { stats: StatsResponse }) {
  if (stats.topRolledFilms.length === 0 && stats.topWatchlistedFilms.length === 0) return null;
  return (
    <section>
      <SectionHeader eyebrow="CineRoll activity" title="Trending now" compact />
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {stats.topRolledFilms.length > 0 && <RankingList icon={<BarChart3 className="h-4 w-4" />} title="Most rolled" films={stats.topRolledFilms} unit="rolls" accent="red" />}
        {stats.topWatchlistedFilms.length > 0 && <RankingList icon={<Film className="h-4 w-4" />} title="Most watchlisted" films={stats.topWatchlistedFilms} unit="saves" accent="blue" />}
      </div>
    </section>
  );
}
