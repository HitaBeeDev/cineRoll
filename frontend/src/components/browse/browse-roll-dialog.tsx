"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useSession } from "next-auth/react";
import { Shuffle, X } from "lucide-react";
import { Dialog } from "@/components/ui/dialog/dialog";
import { DialogClose } from "@/components/ui/dialog/dialog-close";
import { DialogContent } from "@/components/ui/dialog/dialog-content";
import { DialogTitle } from "@/components/ui/dialog/dialog-title";
import { ChannelPill } from "@/components/home/film-card/channel-pill";
import { FilmCard } from "@/components/home/film-card";
import { RollProjector } from "@/components/browse/roll-projector";
import { cn } from "@/lib/utils/cn";
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

  const scrollRef = useRef<HTMLDivElement>(null);
  // Whether the hero has scrolled out from under the header, which is when the
  // header takes over stating what you are looking at.
  const [condensed, setCondensed] = useState(false);
  // Whether the card has been scrolled to its end. Until it has, the last line
  // on screen is a line cut in half by the footer, which reads as the footer
  // sitting on top of the card rather than as more card below.
  const [atEnd, setAtEnd] = useState(true);

  const readScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    // Two thresholds, not one: a single line to cross means a card parked right
    // on it flickers between the two headers on every stray wheel tick.
    setCondensed((was) => (was ? scrollTop > 60 : scrollTop > 104));
    setAtEnd(scrollTop + clientHeight >= scrollHeight - 8);
  }, []);

  // Every draw starts at the top of its own card. Without this a reroll from
  // halfway down the previous one opens the next film mid-plot.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = 0;
    setCondensed(false);
    // Measured, not assumed: whether there is anything below the fold depends on
    // the film — plot length, award count — and settles only once the card has
    // mounted and its poster has taken up its space.
    const observer = new ResizeObserver(readScroll);
    observer.observe(el);
    if (el.firstElementChild) observer.observe(el.firstElementChild);
    readScroll();
    return () => observer.disconnect();
  }, [film?.id, rolling, readScroll]);

  const fade = reducedMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 260, damping: 22, mass: 0.9 };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Wide enough for the card to run in two columns (see FilmCard's `split`).
          At dialog-default width the result was a thin ribbon: the title broke
          across three lines, the plot clamped at three, and everything from the
          scores down lived below the fold of a box with empty page on either side
          of it. A roll is a payoff and wanted the room. */}
      <DialogContent
        showCloseButton={false}
        className={cn(
          // Short of the viewport on purpose. At 90dvh the dialog met the
          // browser chrome top and bottom and stopped reading as a panel over
          // the page — it read as the page, with its own scrollbar.
          "flex max-h-[85dvh] w-[calc(100vw-1.5rem)] max-w-md flex-col overflow-hidden p-0 sm:max-w-3xl",
          "border-[#1c1a25] bg-[#0b0b12]",
        )}
      >
        {/* The card states the title in full a few lines down, so the dialog's
            own name exists for the screen reader and the reader alone. */}
        <DialogTitle className="sr-only">Your roll</DialogTitle>

        {/* Pinned header. Taller content has to scroll — that is what a dialog
            with a fixed ceiling does — but scrolling used to slice the top of
            the card off mid-title, leaving a poster with no name on it and a
            close button floating over whatever had slid under it. The header is
            the part that does not move: it holds the close, and once the hero
            leaves it picks the title back up so the frame always says what you
            are looking at. */}
        <div className="relative z-10 flex shrink-0 items-center gap-3 border-b border-[#17171f] bg-[#0b0b12] px-4 py-2.5">
          <div className="flex min-h-[26px] min-w-0 flex-1 items-center">
            <AnimatePresence mode="wait" initial={false}>
              {film && condensed ? (
                <motion.p
                  key="title"
                  initial={{ opacity: 0, y: reducedMotion ? 0 : -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: reducedMotion ? 0 : 6 }}
                  transition={{ duration: reducedMotion ? 0 : 0.16 }}
                  className="truncate font-[family-name:var(--font-display)] text-[15px] font-bold tracking-tight text-[#F5F5F0]"
                >
                  {film.title}
                </motion.p>
              ) : (
                <motion.div
                  key="pill"
                  initial={{ opacity: 0, y: reducedMotion ? 0 : -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: reducedMotion ? 0 : 6 }}
                  transition={{ duration: reducedMotion ? 0 : 0.16 }}
                  className="min-w-0"
                >
                  <ChannelPill title={film?.title ?? "cineroll"} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <DialogClose
            aria-label="Close dialog"
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#8e899e]",
              "transition-colors duration-150 hover:bg-white/10 hover:text-white",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
            )}
          >
            <X className="h-[18px] w-[18px]" aria-hidden />
          </DialogClose>
        </div>

        {/* Scrollbar hidden, not styled: the site's is a red thumb on a dark
            track, which reads as a design element rather than a scrollbar when it
            runs down the inside edge of a card. The content fits at this width in
            the common case; wheel, drag and keyboard all still scroll. */}
        <div
          ref={scrollRef}
          onScroll={readScroll}
          className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:w-0"
        >
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
                // Deeper at the foot than at the head so the last row of the
                // card — details, list, share — comes to rest clear of the
                // footer instead of stopping flush against it.
                className="p-4 pb-8"
              >
                <FilmCard
                  film={film}
                  isAuthenticated={isAuthenticated}
                  layout="split"
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
            away only if you scroll back down is not.

            Rolling stays the primary action — it is the mechanic the site is
            named for — but it is no longer the loudest thing in the dialog. It
            used to sit on a black slab of its own, a full-width pill under a red
            glow, which made a modal whose subject is a film look like a modal for
            discarding one. Same colour, same place, a third of the presence: one
            shade off the dialog's own background rather than a separate black
            band, and a button sized to a button. */}
        <div className="relative shrink-0 border-t border-[#17171f] bg-[#0b0b12] px-4 py-2.5">
          {/* Sits above the footer, not over the card's last line: while there
              is more to scroll the content fades out into the footer, and the
              fade clears the moment the end is reached, so a half-cut line
              always reads as "keep scrolling" rather than as covered content. */}
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-x-0 bottom-full h-12",
              "bg-gradient-to-t from-[#0b0b12] to-transparent transition-opacity duration-200",
              atEnd ? "opacity-0" : "opacity-100",
            )}
          />
          <button
            type="button"
            onClick={onRoll}
            disabled={rolling}
            className={cn(
              // Sized to its label, centred. Full width of a 768px dialog it
              // stopped reading as a button and started reading as the point of
              // the dialog.
              "mx-auto flex w-full max-w-[15rem] items-center justify-center gap-2 rounded-full bg-[#e8453c] px-5 py-2",
              "font-[family-name:var(--font-geist-mono)] text-[11px] font-semibold uppercase tracking-[0.14em] text-[#09090f]",
              "transition-colors duration-200",
              "hover:bg-[#ff5c52] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff766d]",
              "focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0b12]",
              "disabled:cursor-not-allowed disabled:bg-[#e8453c]/35 disabled:text-[#09090f]/60",
            )}
          >
            <Shuffle className={cn("h-3.5 w-3.5", rolling && "animate-spin")} aria-hidden />
            {rolling ? "Rolling…" : "Roll again"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
