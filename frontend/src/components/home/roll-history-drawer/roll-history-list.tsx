import type { RollFilm } from "@/lib/api";
import { RollHistoryItem } from "@/components/home/roll-history-drawer/roll-history-item";

/** Ordered list of roll-history rows. */
export function RollHistoryList({
  films,
  onNavigate,
}: {
  films: RollFilm[];
  onNavigate: () => void;
}) {
  return (
    <div className="flex flex-col gap-1.5 px-4">
      {films.map((film, index) => (
        <RollHistoryItem
          key={film.id}
          film={film}
          index={index}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  );
}
