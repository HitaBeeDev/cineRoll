import type { PersonProps } from "../component-props";
import { PersonStat } from "./person-stat";

export function PersonStats({ person }: PersonProps) {
  return (
    <div className="mt-8 flex flex-wrap items-baseline gap-x-10 gap-y-4">
      <PersonStat
        value={person.totalNominations}
        label="Nominations"
        accent={false}
      />
      <PersonStat
        value={person.totalWins}
        label="Wins"
        accent={person.totalWins > 0}
      />
      <PersonStat value={person.films.length} label="Films" accent={false} />
    </div>
  );
}
