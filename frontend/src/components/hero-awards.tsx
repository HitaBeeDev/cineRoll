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
  oscar: <Trophy className="h-4 w-4" aria-hidden />,
  globe: <Globe className="h-4 w-4" aria-hidden />,
  cannes: <Award className="h-4 w-4" aria-hidden />,
};

/**
 * The award badges shown in the film detail hero — the page's headline value
 * proposition. Renders one gold badge per ceremony, leading with wins and
 * falling back to nominations when a film was nominated but didn't win.
 * Renders nothing when there are no awards, so non-award films stay clean.
 */
export function HeroAwards({ ceremonies }: { ceremonies: HeroCeremony[] }) {
  if (ceremonies.length === 0) return null;

  return (
    <ul className="mt-6 flex flex-wrap items-center gap-2.5">
      {ceremonies.map((c) => {
        const showWins = c.wins > 0;
        const count = showWins ? c.wins : c.nominations;
        const noun = showWins ? "Win" : "Nomination";
        const label = `${c.shortLabel} ${noun}${count === 1 ? "" : "s"}`;

        return (
          <li
            key={c.shortLabel}
            className="flex items-center gap-2.5 rounded-full border bg-black/45 py-1.5 pl-3 pr-4 backdrop-blur-sm"
            style={{ borderColor: `${GOLD}55` }}
          >
            <span style={{ color: GOLD }}>{CEREMONY_ICON[c.icon]}</span>
            <span className="font-[family-name:var(--font-display)] text-lg font-bold leading-none tabular-nums text-white">
              {count}
            </span>
            <span
              className="font-[family-name:var(--font-geist-mono)] text-[10px] font-semibold uppercase tracking-[0.22em]"
              style={{ color: GOLD }}
            >
              {label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
