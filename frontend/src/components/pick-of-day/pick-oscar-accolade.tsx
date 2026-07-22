import { Trophy } from "lucide-react";
import type { PickOfDayFilm } from "@/lib/api";

/** The Academy Award accolade line. Renders nothing when the film has no Oscar
 *  wins or nominations. */
export function PickOscarAccolade({ film }: { film: PickOfDayFilm }) {
  if (film.oscarWins === 0 && film.oscarNominations === 0) return null;

  return (
    <div className="flex items-start gap-2 rounded-lg border border-amber-400/10 bg-amber-400/5 px-3 py-2">
      <Trophy className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" aria-hidden />
      <p className="text-xs text-zinc-300 leading-snug">
        {film.oscarWins > 0 && (
          <span className="font-semibold text-amber-400">
            {film.oscarWins} Academy Award {film.oscarWins === 1 ? "win" : "wins"}
          </span>
        )}
        {film.oscarWins > 0 &&
          film.oscarNominations > film.oscarWins &&
          ` across ${film.oscarNominations} nominations`}
        {film.oscarWins === 0 &&
          film.oscarNominations > 0 &&
          `Nominated for ${film.oscarNominations} Academy Award${film.oscarNominations > 1 ? "s" : ""}`}
      </p>
    </div>
  );
}
