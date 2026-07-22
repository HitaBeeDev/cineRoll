import { motion, useReducedMotion } from "framer-motion";
import { Award } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AwardHighlight } from "@/components/home/film-card/awards";

/**
 * The header Recognition panel: a gold honors ledger, one row per award body the
 * film touched. Wins read gold, nominations recede, IMDb ranks show a "#N rank".
 */
export function AwardsPanel({ highlights }: { highlights: AwardHighlight[] }) {
  const shouldReduceMotion = useReducedMotion();
  return (
    <section className="relative mt-auto overflow-hidden rounded-xl border border-[#D4AF37]/25 bg-gradient-to-b from-[#D4AF37]/[0.07] to-transparent px-3.5 py-3 shadow-[0_0_24px_rgba(212,175,55,0.06)]">
      {/* Landing beat: a single gold sheen sweeps across as the card settles, so
          the moment registers on the differentiator. Fires once per roll (the
          parent keys this card by film.id). */}
      {!shouldReduceMotion && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent"
          initial={{ x: 0 }}
          animate={{ x: "400%" }}
          transition={{ duration: 0.9, delay: 0.28, ease: "easeOut" }}
        />
      )}
      <h3 className="relative flex items-center gap-1.5 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.28em] text-[#D4AF37]">
        <Award className="h-3.5 w-3.5" aria-hidden />
        Recognition
      </h3>

      {/* Honors ledger: a gold lozenge marks each body the film actually won at;
          wins read gold, nominations recede. Zero-win bodies show noms only. */}
      <ul className="mt-1.5 flex flex-col">
        {highlights.map((item) => {
          const honored = item.wins > 0 || item.rank != null;
          return (
            <li
              key={item.label}
              className="flex items-center justify-between gap-3 border-t border-[#17171f] py-2.5 first:border-t-0"
            >
              <span
                className={cn(
                  "flex min-w-0 items-center gap-2.5 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.16em]",
                  honored ? "text-[#ECE7D6]" : "text-[#8a8a9c]",
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 shrink-0 rotate-45 rounded-[1px]",
                    honored ? "bg-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.55)]" : "bg-[#262634]",
                  )}
                  aria-hidden
                />
                <span className="truncate">{item.label}</span>
              </span>

              {item.rank != null ? (
                <span className="flex shrink-0 items-baseline gap-1 font-[family-name:var(--font-geist-mono)]">
                  <span className="text-base font-bold leading-none text-[#D4AF37]">#{item.rank}</span>
                  <span className="text-[11px] uppercase tracking-[0.12em] text-[#D4AF37]/60">rank</span>
                </span>
              ) : (
                <span className="flex shrink-0 items-baseline gap-3 font-[family-name:var(--font-geist-mono)]">
                  {item.wins > 0 && (
                    <span className="flex items-baseline gap-1">
                      <span className="text-base font-bold leading-none text-[#D4AF37]">{item.wins}</span>
                      <span className="text-[11px] uppercase tracking-[0.14em] text-[#D4AF37]/65">won</span>
                    </span>
                  )}
                  {item.nominations > 0 && (
                    <span className="flex items-baseline gap-1">
                      <span
                        className={cn(
                          "text-base font-bold leading-none",
                          item.wins > 0 ? "text-[#bdbdca]" : "text-[#F5F5F0]",
                        )}
                      >
                        {item.nominations}
                      </span>
                      <span className="text-[11px] uppercase tracking-[0.14em] text-[#6c6c80]">nom</span>
                    </span>
                  )}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
