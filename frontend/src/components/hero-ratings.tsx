import type { ReactNode } from "react";
import { Star } from "lucide-react";

// Source-brand colors. RT is color-coded by the Tomatometer threshold:
// >= 60% is "Fresh" (red), below is "Rotten" (green) — the same convention
// Rotten Tomatoes itself uses.
const IMDB_GOLD = "#F5C518";
const RT_FRESH = "#FA320A";
const RT_ROTTEN = "#13B25B";

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

function ScoreStat({
  accent,
  source,
  caption,
  value,
  suffix,
  icon,
}: {
  accent: string;
  source: string;
  caption?: string;
  value: string;
  suffix: string;
  icon: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="shrink-0">{icon}</span>
      <div className="min-w-0">
        <div className="flex items-baseline gap-1">
          <span
            className="font-[family-name:var(--font-display)] text-[1.8rem] font-bold leading-none text-[#F0F0EC]"
            style={{ textShadow: "0 1px 16px rgba(0,0,0,0.5)" }}
          >
            {value}
          </span>
          <span className="font-[family-name:var(--font-geist-mono)] text-[11px] text-white/40">
            {suffix}
          </span>
        </div>
        <p
          className="mt-1 font-[family-name:var(--font-geist-mono)] text-[10px] font-semibold uppercase tracking-[0.26em]"
          style={{ color: accent }}
        >
          {source}
          {caption && <span className="text-white/40"> · {caption}</span>}
        </p>
      </div>
    </div>
  );
}

/** Minimal tomato mark for the Rotten Tomatoes score (fruit + leaf). */
function TomatoGlyph({ color }: { color: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      aria-hidden
    >
      <circle cx="12" cy="14" r="7" fill={color} />
      <path
        d="M12 7c-1.2-2.2-3.4-3-5-2.6 1 1.8 2.8 2.6 5 2.6Zm0 0c1.2-2.2 3.4-3 5-2.6-1 1.8-2.8 2.6-5 2.6Z"
        fill={color}
      />
    </svg>
  );
}
