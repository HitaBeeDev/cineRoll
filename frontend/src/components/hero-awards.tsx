import type { ReactNode } from "react";
import { Trophy, Globe, Award } from "lucide-react";

// Awards are CineRoll's core differentiator, so the hero leads with them.
// Gold is the universal prestige cue; the icon distinguishes the ceremony.
const GOLD = "#D4AF37";

type HeroCeremony = {
  shortLabel: string;
  icon: "oscar" | "globe" | "cannes";
  wins: number;
  nominations: number;
};

const CEREMONY_ICON: Record<HeroCeremony["icon"], ReactNode> = {
  oscar: <Trophy className="h-[18px] w-[18px]" aria-hidden />,
  globe: <Globe className="h-[18px] w-[18px]" aria-hidden />,
  cannes: <Award className="h-[18px] w-[18px]" aria-hidden />,
};

/**
 * The award accolades band shown in the film detail hero — the page's headline
 * value proposition and the one thing CineRoll foregrounds that the big film
 * sites bury. Each ceremony gets a large gold numeral with its glyph chip, so
 * the award count visually out-weighs the ratings and spec rows rather than
 * reading as a timid pill. Leads with wins, falling back to nominations when a
 * film was nominated but didn't win. Renders nothing when there are no awards,
 * so non-award films stay clean.
 */
export function HeroAwards({ ceremonies }: { ceremonies: HeroCeremony[] }) {
  if (ceremonies.length === 0) return null;

  return (
    <div className="mt-8 flex flex-wrap items-center gap-x-9 gap-y-5">
      {ceremonies.map((c) => {
        const showWins = c.wins > 0;
        const count = showWins ? c.wins : c.nominations;
        const noun = `${showWins ? "Win" : "Nomination"}${count === 1 ? "" : "s"}`;

        return (
          <div key={c.shortLabel} className="flex items-center gap-3.5">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
              style={{
                background: `${GOLD}1c`,
                color: GOLD,
                boxShadow: `inset 0 0 0 1px ${GOLD}33`,
              }}
            >
              {CEREMONY_ICON[c.icon]}
            </span>

            <div>
              <div className="flex items-baseline gap-2">
                <span
                  className="font-[family-name:var(--font-display)] font-bold leading-none tabular-nums"
                  style={{
                    fontSize: "clamp(2.25rem,3.4vw,3rem)",
                    color: GOLD,
                    textShadow: `0 0 30px ${GOLD}45`,
                  }}
                >
                  {count}
                </span>
                <span className="font-[family-name:var(--font-display)] text-base font-semibold leading-tight text-white/90">
                  {c.shortLabel}
                </span>
              </div>
              <span
                className="mt-1.5 block font-[family-name:var(--font-geist-mono)] text-[10px] font-semibold uppercase tracking-[0.34em]"
                style={{ color: `${GOLD}cc` }}
              >
                {noun}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
