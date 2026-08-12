import { Trophy } from "lucide-react";
import { FilmLink } from "@/components/film-link";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils/cn";
import { formatAwardHighlight } from "@/components/home/film-card/awards/format-award-highlight";
import type { AwardHighlight } from "@/components/home/film-card/awards/award-highlight";

/**
 * Why this film is in CineRoll, in one line.
 *
 * It replaces a bordered gold panel that stated the same thing in about six
 * times the height: a heading, a ruled row per body, and a large number beside
 * an abbreviation. Wins read bright, nominations recede, and neither needs a box.
 *
 * Given a `slug` the line becomes the way to the record it summarises — the
 * detail page's awards section, by name, rather than the top of the page with
 * the categories and years left to find. That matters most where the itemised
 * list is not on screen at all, which is every roll panel: the summary is then
 * the only claim being made, and a claim about awards on a site about awards
 * should be checkable.
 */
export function RecognitionSummary({
  highlights,
  slug,
  filmId,
  onEngage,
}: {
  highlights: AwardHighlight[];
  /** Omit to render the line as plain text. */
  slug?: string;
  filmId?: string;
  onEngage?: (() => void) | undefined;
}) {
  const line = (
    <>
      {/* A trophy, not a medal: the medal glyph read as a generic badge, and the
          rest of the card's iconography is drawn from what the thing is. */}
      <Trophy className="h-4 w-4 shrink-0 text-gold" aria-hidden />
      {highlights.map((highlight, index) => (
        <span key={highlight.label} className="flex items-center gap-2">
          {index > 0 && (
            <span aria-hidden className="text-fg-faint">
              ·
            </span>
          )}
          <span
            className={cn(
              highlight.wins > 0 || highlight.rank != null ? "text-fg-hi" : "text-fg-muted",
            )}
          >
            {formatAwardHighlight(highlight)}
          </span>
        </span>
      ))}
    </>
  );

  const className = "flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[13px] leading-[1.5]";

  if (!slug) return <p className={className}>{line}</p>;

  return (
    <FilmLink
      slug={slug}
      hash="awards"
      onClick={() => {
        onEngage?.();
        if (filmId) {
          trackEvent({
            type: "film_click",
            filmId,
            context: { source: "roll_card_awards", slug },
          });
        }
      }}
      className={cn(
        className,
        "w-fit rounded-sm underline decoration-gold/30 underline-offset-4",
        "transition-colors hover:decoration-gold/70",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
      )}
    >
      {line}
    </FilmLink>
  );
}
