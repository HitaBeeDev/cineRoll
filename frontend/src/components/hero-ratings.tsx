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

  return (
    <div className="mt-8 flex flex-wrap items-start gap-8">
      {imdbRating != null && <Score label="IMDb" value={imdbRating.toFixed(1)} />}
      {rtScore != null && <Score label="RT" value={`${rtScore}%`} />}
    </div>
  );
}

function Score({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-1.5 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.5em] text-white/55">
        {label}
      </p>
      <p className="font-[family-name:var(--font-display)] text-[2.5rem] font-bold leading-none text-[#F8F8F4]">
        {value}
      </p>
    </div>
  );
}
