"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useSession } from "next-auth/react";
import { Shuffle } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { FilmCard } from "@/components/home/film-card";
import { RollProjector } from "@/components/browse/roll-projector";
import { cn } from "@/lib/utils";
import type { RollFilm } from "@/lib/api";
import type { BrowseRollError } from "@/hooks/useBrowseRoll";

/**
 * The roll result, on the browse page, in a dialog.
 *
 * It shows the same card the home page shows, not a reduced copy of it. The card
 * is where every roll-tuning signal lives — not tonight, already seen, not
 * interested, save for later — and those are the reason a roll is worth making
 * twice: each one teaches the next draw. A trimmed-down version here would have
 * meant the same roll taught the engine less depending on which page you happened
 * to be rolling from, which is not a distinction the engine should be able to see.
 *
 * What is smaller is the frame around it: one column at dialog width instead of
 * the home page's side-by-side, and the four signals double as the reroll — each
 * of them answers "not this one" and so each of them rolls again on its way out.
 */
export function BrowseRollDialog({
  open,
  rolling,
  film,
  error,
  onOpenChange,
  onRoll,
  onClearFilters,
}: {
  open: boolean;
  rolling: boolean;
  film: RollFilm | null;
  error: BrowseRollError | null;
  onOpenChange: (open: boolean) => void;
  /** Draws again — the footer button, the retry, and every card signal share it. */
  onRoll: () => void;
  onClearFilters: () => void;
}) {
  const reducedMotion = useReducedMotion() ?? false;
  const isAuthenticated = useSession().status === "authenticated";

  const fade = reducedMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 260, damping: 22, mass: 0.9 };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex max-h-[90dvh] w-[calc(100vw-1.5rem)] max-w-md flex-col overflow-hidden p-0",
          "border-[#1c1a25] bg-[#0b0b12]",
        )}
      >
        {/* The card states the title in full a few lines down, so the dialog's
            own name exists for the screen reader and the reader alone. */}
        <DialogTitle className="sr-only">Your roll</DialogTitle>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {rolling ? (
              <motion.div
                key="rolling"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reducedMotion ? 0 : 0.18 }}
              >
                <RollProjector />
              </motion.div>
            ) : film ? (
              /* Keyed by film id so the card remounts per roll: its action state
                 (seen, saved, the sentiment prompt) belongs to one film and must
                 not carry over to the next one drawn into the same dialog. */
              <motion.div
                key={film.id}
                initial={{ opacity: 0, y: reducedMotion ? 0 : 16, scale: reducedMotion ? 1 : 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, transition: { duration: reducedMotion ? 0 : 0.15 } }}
                transition={fade}
                className="p-4"
              >
                <FilmCard
                  film={film}
                  isAuthenticated={isAuthenticated}
                  onNotTonight={onRoll}
                  onNotInterested={onRoll}
                  onWatched={onRoll}
                  onSaved={onRoll}
                />
              </motion.div>
            ) : (
              <motion.div
                key={error ?? "idle"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reducedMotion ? 0 : 0.18 }}
                className="flex flex-col items-center gap-3 px-6 py-12 text-center"
              >
                <p className="text-sm text-[#e8e5f4]">
                  {error === "empty"
                    ? "No films match these filters."
                    : "The roll didn't come back."}
                </p>
                <p className="text-xs leading-relaxed text-[#8e899e]">
                  {error === "empty"
                    ? "Loosen a filter and roll again — or clear them and roll the whole catalogue."
                    : "Check your connection and try again."}
                </p>
                {error === "empty" && (
                  <button
                    type="button"
                    onClick={() => {
                      onClearFilters();
                      onOpenChange(false);
                    }}
                    className="mt-1 font-[family-name:var(--font-geist-mono)] text-[12px] text-[#a9a5bc] underline decoration-white/25 underline-offset-4 transition-colors hover:text-[#ff766d]"
                  >
                    Clear all filters
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Pinned, not scrolled with the card: the whole point of rolling in place
            is that another draw is one click away, and a button that is one click
            away only if you scroll back down is not. */}
        <div className="shrink-0 border-t border-[#17171f] bg-[#08080d] p-3">
          <button
            type="button"
            onClick={onRoll}
            disabled={rolling}
            className={cn(
              "flex w-full items-center justify-center gap-2.5 rounded-full bg-[#e8453c] px-5 py-3",
              "font-[family-name:var(--font-geist-mono)] text-[12px] font-semibold uppercase tracking-[0.16em] text-[#09090f]",
              "shadow-[0_10px_30px_-14px_rgba(232,69,60,0.9)] transition-all duration-200",
              "hover:bg-[#ff5c52] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff766d]",
              "focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080d]",
              "disabled:cursor-not-allowed disabled:bg-[#e8453c]/35 disabled:text-[#09090f]/60 disabled:shadow-none",
            )}
          >
            <Shuffle className={cn("h-4 w-4", rolling && "animate-spin")} aria-hidden />
            {rolling ? "Rolling…" : "Roll again"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
