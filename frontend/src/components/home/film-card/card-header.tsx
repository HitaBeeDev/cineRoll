import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import { tmdbImageUrl } from "@/lib/images/tmdb-image-url";
import { CardPoster } from "@/components/home/film-card/card-poster";
import { CardIdentity } from "@/components/home/film-card/card-identity";
import type { AwardHighlight } from "@/components/home/film-card/awards/award-highlight";
import type { RollFilm } from "@/lib/api";

/**
 * The verdict header — a horizontal composition that fits in one viewport: the
 * poster anchors the left, the identity column stacks beside it, and a strongly
 * dimmed blurred backdrop sits behind for ambient depth. The whole payoff
 * (poster + title + recognition) is visible at a glance instead of scrolled.
 */
export function CardHeader({
  film,
  posterBlur,
  awardHighlights,
  onEngage,
  compact = false,
  showRecognition = true,
}: {
  film: RollFilm;
  posterBlur: string;
  awardHighlights: AwardHighlight[];
  onEngage?: (() => void) | undefined;
  /**
   * The roll panel's sizing: a smaller poster, a smaller title, tighter
   * padding. The panel shares its height with the grid below it, and at full
   * size this header alone took most of it before the film had said anything.
   */
  compact?: boolean;
  /** Off where the itemised "Recognized for" list is also on screen — the
   *  summary line and the list state the same awards. */
  showRecognition?: boolean;
}) {
  const { backdropUrl } = film;

  return (
    <div className="relative rounded-xl">
      {/* Ambient backdrop layer — clipped to the rounded box so the blur stays
          inside. Kept separate from the header so a hovered poster can scale up
          and out without being clipped. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
        {backdropUrl ? (
          <Image
            src={tmdbImageUrl(backdropUrl, "w780") ?? backdropUrl}
            alt=""
            aria-hidden
            fill
            sizes="(max-width: 1024px) 100vw, 500px"
            placeholder="blur"
            blurDataURL={posterBlur}
            className="scale-110 object-cover opacity-25 blur-2xl"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-ink-750 to-ink-950" />
        )}
        <div className="absolute inset-0 bg-ink-900/75" />
      </div>

      <div className={cn("relative flex", compact ? "gap-3 p-3" : "gap-4 p-4")}>
        <CardPoster
          film={film}
          posterBlur={posterBlur}
          onEngage={onEngage}
          compact={compact}
        />
        <CardIdentity
          film={film}
          awardHighlights={awardHighlights}
          compact={compact}
          showRecognition={showRecognition}
        />
      </div>
    </div>
  );
}
