import { Crown, Users } from "lucide-react";
import type { StatsResponse } from "../types";
import { PersonRecordGroup } from "./person-record-group";
import { SectionHeader } from "./section-header";

export function PeopleSection({ stats }: { stats: StatsResponse }) {
  if (stats.topNominatedPeople.length === 0 && stats.topWinningPeople.length === 0) return null;
  return (
    <section>
      <SectionHeader eyebrow="Behind the records" title="The people" compact />
      <div className="mt-6 grid min-w-0 gap-6 lg:grid-cols-2">
        {stats.topWinningPeople.length > 0 && <PersonRecordGroup heading="Most winning" icon={<Crown className="h-4 w-4" />} people={stats.topWinningPeople} unit="wins" accent="red" />}
        {stats.topNominatedPeople.length > 0 && <PersonRecordGroup heading="Most nominated" icon={<Users className="h-4 w-4" />} people={stats.topNominatedPeople} unit="nominations" accent="blue" />}
      </div>
    </section>
  );
}
