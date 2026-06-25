import { Trophy } from "lucide-react";

// Prestige gold, matched to the hero Accolades module.
const GOLD = "#D4AF37";

export type HeadlineAccolade = {
  category: string;
  ceremony: string;
  year: number;
  won: boolean;
};

/**
 * The hero's right-third when a film has a real backdrop (so the poster card is
 * dropped). Instead of leaving prime real estate to the scene alone, it leads
 * with the film's single most prestigious accolade — the headline a visitor
 * came for — plus the win/nomination totals and a jump to the full breakdown.
 *
 * Deliberately NOT a filled card: a left gold rule plus a soft, feathered dark
 * halo give legibility over the bright scene while reading as ambient depth,
 * not a modal floating on the hero. Desktop only; it owns its own visibility so
 * the hero layout stays declarative.
 */
export function HeroHeadlineAccolade({
  headline,
  totalWins,
  totalNominations,
}: {
  headline: HeadlineAccolade | null;
  totalWins: number;
  totalNominations: number;
}) {
  return (
    <aside className="relative hidden w-[330px] shrink-0 lg:block">
      {/* Feathered dark halo — keeps the text legible over the lightest part of
          the backdrop without presenting a hard rectangular edge. */}
      <div
        className="pointer-events-none absolute -inset-x-10 -inset-y-12 -z-10 blur-2xl"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(7,7,11,0.88), transparent 72%)",
        }}
      />

      <div
        className="border-l-2 pl-6"
        style={{ borderColor: `${GOLD}55` }}
      >
        {headline && (
          <>
            <div className="flex items-center gap-2.5">
              <Trophy className="h-4 w-4" style={{ color: GOLD }} aria-hidden />
              <span
                className="font-[family-name:var(--font-geist-mono)] text-[10px] font-semibold uppercase tracking-[0.42em]"
                style={{ color: `${GOLD}cc` }}
              >
                {headline.won ? "Winner" : "Nominated"}
              </span>
            </div>

            <p
              className="mt-4 font-[family-name:var(--font-display)] text-[2rem] font-bold leading-[1.05] text-[#F4ECD6]"
              style={{ textShadow: "0 2px 24px rgba(0,0,0,0.75)" }}
            >
              {headline.category}
            </p>

            <p className="mt-3 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.22em] text-white/70">
              {headline.year} · {headline.ceremony}
            </p>
          </>
        )}

        {/* Totals */}
        <div
          className={
            (headline ? "mt-7 border-t border-white/12 pt-6 " : "") +
            "flex items-baseline gap-4"
          }
        >
          <Total value={totalWins} label={totalWins === 1 ? "Win" : "Wins"} gold />
          <span aria-hidden className="text-white/20">
            ·
          </span>
          <Total
            value={totalNominations}
            label={totalNominations === 1 ? "Nomination" : "Nominations"}
          />
        </div>

        <a
          href="#awards"
          className="group mt-5 inline-flex items-center gap-2 font-[family-name:var(--font-geist-mono)] text-[10px] font-semibold uppercase tracking-[0.3em] text-white/50 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]"
        >
          See full breakdown
          <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </a>
      </div>
    </aside>
  );
}

function Total({
  value,
  label,
  gold,
}: {
  value: number;
  label: string;
  gold?: boolean;
}) {
  return (
    <span className="flex items-baseline gap-1.5">
      <span
        className="font-[family-name:var(--font-display)] text-2xl font-bold leading-none tabular-nums"
        style={{ color: gold ? GOLD : "#c8c8e0" }}
      >
        {value}
      </span>
      <span className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.24em] text-white/45">
        {label}
      </span>
    </span>
  );
}
