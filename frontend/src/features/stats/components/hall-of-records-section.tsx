import type { StatsResponse } from "../types";
import { FilmRecordGroup } from "./film-record-group";
import { SectionHeader } from "./section-header";

export function HallOfRecordsSection({ stats }: { stats: StatsResponse }) {
  if (stats.topWinningFilms.length === 0 && stats.topNominatedFilms.length === 0) return null;
  return (
    <section>
      <SectionHeader eyebrow="Archive records" title="Hall of Records" description="The films and people that dominate the archive." actionHref="/browse?sort=awards" actionLabel="Enter the leaderboard" />
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        {stats.topWinningFilms.length > 0 && <FilmRecordGroup heading="Most awarded films" films={stats.topWinningFilms} unit="wins" accent="red" />}
        {stats.topNominatedFilms.length > 0 && <FilmRecordGroup heading="Most nominated films" films={stats.topNominatedFilms} unit="nominations" accent="blue" />}
      </div>
    </section>
  );
}
