import Image from "next/image";
import { tmdbImageUrl } from "@/lib/images";
import { CardPoster } from "@/components/home/film-card/card-poster";
import { CardIdentity } from "@/components/home/film-card/card-identity";
import type { AwardHighlight } from "@/components/home/film-card/awards";
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
}: {
  film: RollFilm;
  posterBlur: string;
  awardHighlights: AwardHighlight[];
  onEngage?: (() => void) | undefined;
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
          <div className="absolute inset-0 bg-gradient-to-br from-[#15151f] to-[#0a0a14]" />
        )}
        <div className="absolute inset-0 bg-[#09090f]/75" />
      </div>

      <div className="relative flex gap-4 p-4">
        <CardPoster film={film} posterBlur={posterBlur} onEngage={onEngage} />
        <CardIdentity film={film} awardHighlights={awardHighlights} />
      </div>
    </div>
  );
}
