import { FilmLink } from "@/components/film-link";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils/cn";
import type { RollFilm } from "@/lib/api";

/**
 * The way out of a roll card and into the whole film.
 *
 * Lives in its own file because it sits in two places: the card's action row on
 * the home page, and the roll dialog's pinned footer, where it has to be
 * reachable without scrolling. Both spell the destination and the tracking the
 * same way; only the shape differs, via `className`.
 */
export function ViewDetailsLink({
  film,
  onEngage,
  className,
}: {
  film: RollFilm;
  onEngage?: (() => void) | undefined;
  className?: string | undefined;
}) {
  return (
    <FilmLink
      slug={film.slug}
      onClick={() => {
        onEngage?.();
        trackEvent({
          type: "film_click",
          filmId: film.id,
          context: { source: "roll_card", slug: film.slug },
        });
      }}
      className={cn(
        "flex items-center justify-center text-[#F5F5F0]",
        "font-[family-name:var(--font-geist-mono)] font-bold uppercase",
        "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
        className,
      )}
    >
      View details
    </FilmLink>
  );
}
