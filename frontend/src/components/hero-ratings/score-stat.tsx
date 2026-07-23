import type { ReactNode } from "react";

/** One critic-score readout: icon, big value + suffix, and the source label. */
export function ScoreStat({
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
  // Spell the meaning out for assistive tech so it never depends on the colour
  // or the visual "·" separator: e.g. "Rotten Tomatoes: 92% — Fresh".
  const label = `${source}: ${value}${suffix}${caption ? ` — ${caption}` : ""}`;

  return (
    <div className="flex items-center gap-3" role="img" aria-label={label}>
      <span className="shrink-0" aria-hidden>
        {icon}
      </span>
      <div className="min-w-0" aria-hidden>
        <div className="flex items-baseline gap-1">
          <span
            className="font-[family-name:var(--font-display)] text-[1.8rem] font-bold leading-none text-[#F0F0EC]"
            style={{ textShadow: "0 1px 16px rgba(0,0,0,0.5)" }}
          >
            {value}
          </span>
          <span className="font-[family-name:var(--font-geist-mono)] text-[11px] text-white/55">
            {suffix}
          </span>
        </div>
        <p
          className="mt-1 font-[family-name:var(--font-geist-mono)] text-[10px] font-semibold uppercase tracking-[0.26em]"
          style={{ color: accent }}
        >
          {source}
        </p>
      </div>
    </div>
  );
}
