import type { FilmStat } from "../types";
import { FilmRecordGroup } from "./film-record-group";
import { SectionHeader } from "./section-header";

export function BattleLeaderboardSection({ films }: { films: FilmStat[] }) {
  if (films.length === 0) return null;
  return (
    <section>
      <SectionHeader eyebrow="Roll Battle" title="Head-to-head champions" description="Ranked by an Elo rating earned from every Versus duel players vote on — not awards, but which film wins the room." actionHref="/roll-battle" actionLabel="Enter the arena" />
      <div className="mt-6"><FilmRecordGroup heading="Highest Elo in head-to-head play" films={films} unit="Elo" accent="red" /></div>
    </section>
  );
}
