"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useSession } from "next-auth/react";
import { Shuffle, X } from "lucide-react";
import { ChannelPill } from "@/components/home/film-card/channel-pill";
import { FilmCard } from "@/components/home/film-card";
import { ViewDetailsLink } from "@/components/home/film-card/view-details-link";
import { RollProjector } from "@/components/browse/roll-projector";
import { cn } from "@/lib/utils/cn";
import type { RollFilm } from "@/lib/api";
import type { BrowseRollError } from "@/hooks/useBrowseRoll";

/**
 * The roll result, on the browse page, in the page.
 *
 * It was a dialog. The argument for that was "keep the results behind you", but
 * a dialog cannot keep anything behind you: it dims the page, locks its scroll,
 * and traps focus, so the filters that produced the draw were visible and
 * useless at the same time. Everything that made the dialog work was there to
 * fight its own frame — a fixed ceiling, an inner scroll container, a mask fade
 * at the cut line, a header that swapped to the film's title once the hero
 * scrolled under it, a ResizeObserver to know when any of that applied. None of
 * it is needed by a panel that is simply part of the page and as tall as it
 * needs to be.
 *
 * What is left is the shape of the answer: what you drew, what you can do about
 * it, and the two ways out — the film, or another draw.
 */
export function BrowseRollPanel({
  open,
  rolling,
  film,
  error,
  onClose,
  onRoll,
  onClearFilters,
  onEngage,
  onNotInterested,
}: {
  open: boolean;
  rolling: boolean;
  film: RollFilm | null;
  error: BrowseRollError | null;
  onClose: () => void;
  /** Draws again — the footer button, the retry, and every card signal share it. */
  onRoll: () => void;
  onClearFilters: () => void;
  /** Records that this draw landed (details, save, seen), so the next one is
   *  not scored as a miss. */
  onEngage: () => void;
  /** Records "not interested" — a strong, lasting push away from this kind of
   *  film, as opposed to "not tonight", which only skips it. */
  onNotInterested: () => void;
}) {
  const reducedMotion = useReducedMotion() ?? false;
  const isAuthenticated = useSession().status === "authenticated";
  const panelRef = useRef<HTMLElement>(null);

  // The panel opens above the grid, which is where the eye already is — but not
  // if the reader had scrolled down among the results before rolling. Bringing it
  // into view is the one thing the dialog's overlay did for free.
  useEffect(() => {
    if (!open) return;
    panelRef.current?.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "nearest",
    });
  }, [open, film?.id, reducedMotion]);

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.section
          ref={panelRef}
          key="roll-panel"
          aria-label="Your roll"
          initial={reducedMotion ? false : { opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
          // `overflow-hidden` is what lets the height animation clip its own
          // content instead of spilling it over the grid on the way in.
          className="overflow-hidden"
        >
          <div
            className={cn(
              "mb-6 rounded-2xl border border-[#1c1a25] bg-[#0d0d15]",
              // Sits above the grid without floating over it: a hairline and a
              // slightly lifted surface are enough to read as its own object on
              // a page this dark. No overlay, no drop shadow, no blur.
              "shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset]",
            )}
          >
            <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-2.5">
              <div className="flex min-h-[26px] min-w-0 flex-1 items-center">
                <ChannelPill title={film?.title ?? "cineroll"} />
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Dismiss roll"
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#a8a8ba]",
                  "transition-colors duration-150 hover:bg-white/10 hover:text-white",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
                )}
              >
                <X className="h-[18px] w-[18px]" aria-hidden />
              </button>
            </div>

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
                   not carry over to the next one drawn into the same panel. */
                <motion.div
                  key={film.id}
                  initial={{ opacity: 0, y: reducedMotion ? 0 : 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, transition: { duration: reducedMotion ? 0 : 0.15 } }}
                  transition={{ duration: reducedMotion ? 0 : 0.24 }}
                  className="p-4"
                >
                  {/* Only "not tonight" draws again. The other three record
                      something about this film, and a card that vanishes the
                      instant you record something never gets to show you that it
                      did. Rolling on is the footer's job. */}
                  <FilmCard
                    film={film}
                    isAuthenticated={isAuthenticated}
                    layout="split"
                    onNotTonight={onRoll}
                    onEngage={onEngage}
                    onNotInterested={onNotInterested}
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
                  <p className="text-[13px] leading-[1.6] text-[#b0b0c0]">
                    {error === "empty"
                      ? "Loosen a filter and roll again — or clear them and roll the whole catalogue."
                      : "Check your connection and try again."}
                  </p>
                  {error === "empty" && (
                    <button
                      type="button"
                      onClick={() => {
                        onClearFilters();
                        onClose();
                      }}
                      className="mt-1 font-[family-name:var(--font-geist-mono)] text-[12px] text-[#c2c2d0] underline decoration-white/25 underline-offset-4 transition-colors hover:text-[#ff766d]"
                    >
                      Clear all filters
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Both answers to the one question the panel asks — is this the film?
                Roll again keeps the colour, since it is the mechanic the site is
                named for; it no longer keeps the monopoly. */}
            <div className="border-t border-white/[0.06] px-4 py-2.5">
              <div className="mx-auto flex w-full max-w-[26rem] items-center gap-2">
                {film && !rolling && (
                  <ViewDetailsLink
                    film={film}
                    onEngage={onEngage}
                    className={cn(
                      "flex-1 rounded-full border border-[#2a2a3e] px-5 py-2",
                      "text-[11px] tracking-[0.14em] hover:border-[#6a6a85]",
                    )}
                  />
                )}

                <button
                  type="button"
                  onClick={onRoll}
                  disabled={rolling}
                  className={cn(
                    "mx-auto flex w-full max-w-[15rem] flex-1 items-center justify-center gap-2 rounded-full bg-[#e8453c] px-5 py-2",
                    "font-[family-name:var(--font-geist-mono)] text-[11px] font-semibold uppercase tracking-[0.14em] text-[#09090f]",
                    "transition-colors duration-200",
                    "hover:bg-[#ff5c52] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff766d]",
                    "focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900",
                    "disabled:cursor-not-allowed disabled:bg-[#e8453c]/35 disabled:text-[#09090f]/60",
                  )}
                >
                  <Shuffle className={cn("h-3.5 w-3.5", rolling && "animate-spin")} aria-hidden />
                  {rolling ? "Rolling…" : "Roll again"}
                </button>
              </div>
            </div>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
