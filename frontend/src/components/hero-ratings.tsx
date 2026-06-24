import type { ReactNode } from "react";
import { Star } from "lucide-react";

// Source-brand colors. RT is color-coded by the Tomatometer threshold:
// >= 60% is "Fresh" (red), below is "Rotten" (green) — the same convention
// Rotten Tomatoes itself uses.
const IMDB_GOLD = "#F5C518";
const RT_FRESH = "#FA320A";
const RT_ROTTEN = "#13B25B";

/**
 * Critic scores shown in the film detail hero. Renders nothing when neither
 * score exists, so a missing rating leaves no empty slot.
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
    <div className="mt-8 flex flex-wrap items-stretch gap-3">
      {imdbRating != null && (
        <ScoreCard
          accent={IMDB_GOLD}
          source="IMDb"
          value={imdbRating.toFixed(1)}
          suffix="/10"
          icon={
            <Star
              className="h-4 w-4"
              style={{ fill: IMDB_GOLD, color: IMDB_GOLD }}
              aria-hidden
            />
          }
        />
      )}
      {rtScore != null && (
        <ScoreCard
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

function ScoreCard({
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
    <div
      className="flex items-center gap-3.5 rounded-xl border bg-black/45 px-4 py-3 backdrop-blur-sm"
      style={{ borderColor: `${accent}40` }}
    >
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
        style={{ background: `${accent}1f` }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <div className="flex items-baseline gap-1">
          <span className="font-[family-name:var(--font-display)] text-[2rem] font-bold leading-none text-[#F8F8F4]">
            {value}
          </span>
          <span className="font-[family-name:var(--font-geist-mono)] text-xs text-white/40">
            {suffix}
          </span>
        </div>
        <p
          className="mt-1.5 font-[family-name:var(--font-geist-mono)] text-[10px] font-semibold uppercase tracking-[0.28em]"
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
      className="h-4 w-4"
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
