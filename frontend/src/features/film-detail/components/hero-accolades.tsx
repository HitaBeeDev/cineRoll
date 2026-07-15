import { HeroAwards } from "@/components/hero-awards";
import { HeroRatings } from "@/components/hero-ratings";
import { HERO_AWARD_GOLD } from "../config";
import type { HeroAccoladesProps } from "../component-props";

export function HeroAccolades({
  film,
  summary,
}: HeroAccoladesProps) {
  const hasAwards = summary.totalNominations > 0;
  const hasRatings = film.imdbRating != null || film.rtScore != null;
  if (!hasAwards && !hasRatings) return null;

  return (
    <div className="mt-10">
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="h-px w-7"
          style={{
            background: `linear-gradient(to right, ${HERO_AWARD_GOLD}, transparent)`,
          }}
        />
        <span className="font-[family-name:var(--font-geist-mono)] text-[10px] font-semibold uppercase tracking-[0.42em] text-white/50">
          {hasAwards ? "Accolades" : "Critic Scores"}
        </span>
      </div>
      <div className="mt-6 space-y-6">
        {hasAwards && <HeroAwards ceremonies={summary.ceremonies} />}
        {hasAwards && hasRatings && (
          <div className="h-px w-full max-w-md bg-gradient-to-r from-white/14 via-white/[0.06] to-transparent" />
        )}
        <HeroRatings imdbRating={film.imdbRating} rtScore={film.rtScore} />
      </div>
    </div>
  );
}
