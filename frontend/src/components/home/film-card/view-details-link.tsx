import { FilmLink } from "@/components/film-link";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils/cn";
import type { RollFilm } from "@/lib/api";

/**
 * The way out of a roll card and into the whole film.
 *
 * Lives in its own file because it sits in two places: the card's action row on
 * the home page, and the roll panel's footer, where it is the primary action.
 * Both spell the destination and the tracking the same way; only the shape
 * differs, via `className`.
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
        "flex items-center justify-center",
        // Sentence case: it is a phrase, not a label, and tracked capitals are
        // the slowest way to set a phrase.
        "font-[family-name:var(--font-geist-mono)] font-bold",
        "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        // Colour comes from the caller: this is a ghost on the card and a filled
        // primary in the panel footer, and `cn` is a plain join — a default
        // text colour here would sit in the class list beside the override and
        // let stylesheet order decide which one wins.
        className,
      )}
    >
      View details
    </FilmLink>
  );
}
