import { Star } from "lucide-react";
import {
  IMDB_GOLD,
  RT_FRESH,
  RT_ROTTEN,
} from "@/components/hero-ratings/constants";
import { ScoreStat } from "@/components/hero-ratings/score-stat";
import { TomatoGlyph } from "@/components/hero-ratings/tomato-glyph";

/**
 * Critic scores shown in the film detail hero. Rendered as light inline
 * readouts — not filled cards — so they sit clearly *below* the gold award
 * band in the visual hierarchy: CineRoll's own award data leads, third-party
 * scores support. Renders nothing when neither score exists, so a missing
 * rating leaves no empty slot.
 */
export function HeroRatings({
  imdbRating,
  rtScore,
}: {
  imdbRating: number | null;
  rtScore: number | null;
}) {
  if (imdbRating == null && rtScore == null) return null;

  const rtFresh = rtScore != null && rtScore >= 60;

  return (
    <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
      {imdbRating != null && (
        <ScoreStat
          accent={IMDB_GOLD}
          source="IMDb"
          value={imdbRating.toFixed(1)}
          suffix="/10"
          icon={
            <Star
              className="h-[18px] w-[18px]"
              style={{ fill: IMDB_GOLD, color: IMDB_GOLD }}
              aria-hidden
            />
          }
        />
      )}
      {rtScore != null && (
        <ScoreStat
          accent={rtFresh ? RT_FRESH : RT_ROTTEN}
          source="Rotten Tomatoes"
          caption={rtFresh ? "Fresh" : "Rotten"}
          value={`${rtScore}`}
          suffix="%"
          icon={<TomatoGlyph color={rtFresh ? RT_FRESH : RT_ROTTEN} />}
        />
      )}
    </div>
  );
}
