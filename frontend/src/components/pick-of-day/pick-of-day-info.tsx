import Link from "next/link";
import { Clock, ExternalLink } from "lucide-react";
import type { PickOfDayFilm } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import { formatFilmLength } from "@/lib/format";
import { cn } from "@/lib/utils";
import { getWhyPicked } from "@/components/pick-of-day/why-picked";
import { PickRatingsRow } from "@/components/pick-of-day/pick-ratings-row";
import { WhyPickedNote } from "@/components/pick-of-day/why-picked-note";
import { PickOscarAccolade } from "@/components/pick-of-day/pick-oscar-accolade";

/** The pick card's info column: staff-pick date, title/meta, ratings, plot, the
 *  rationale and accolade callouts, and the details link. */
export function PickOfDayInfo({ film }: { film: PickOfDayFilm }) {
  const pickDate = film.pickOfDayDate
    ? new Date(film.pickOfDayDate).toLocaleDateString("en-US", { month: "long", day: "numeric" })
    : null;
  const runtime = formatFilmLength(film);

  return (
    <div className="flex flex-col gap-3 min-w-0 flex-1">
      {pickDate && (
        <p className="text-xs font-medium tracking-wide uppercase text-amber-400/70">
          Staff pick · {pickDate}
        </p>
      )}

      <div>
        <h3 className="text-xl sm:text-2xl font-bold text-zinc-50 leading-tight">
          {film.title}
        </h3>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-zinc-400">
          <span>{film.year}</span>
          {runtime && (
            <>
              <span className="text-zinc-700" aria-hidden>·</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" aria-hidden />
                {runtime}
              </span>
            </>
          )}
          {film.director && (
            <>
              <span className="text-zinc-700" aria-hidden>·</span>
              <span>dir. {film.director}</span>
            </>
          )}
        </div>
      </div>

      <PickRatingsRow film={film} />

      {film.plot && (
        <p className="text-sm text-zinc-400 leading-relaxed line-clamp-3 sm:line-clamp-4">
          {film.plot}
        </p>
      )}

      <WhyPickedNote text={getWhyPicked(film)} />
      <PickOscarAccolade film={film} />

      <Link
        href={`/film/${film.slug}`}
        onClick={() => {
          trackEvent({
            type: "pick_of_day_click",
            filmId: film.id,
            context: { source: "pick_of_day_card", slug: film.slug },
          });
        }}
        className={cn(
          "inline-flex items-center gap-1.5 self-start mt-auto pt-1",
          "text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded",
        )}
      >
        View full details
        <ExternalLink className="h-3.5 w-3.5" aria-hidden />
      </Link>
    </div>
  );
}
