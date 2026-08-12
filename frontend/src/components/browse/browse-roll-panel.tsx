"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useSession } from "next-auth/react";
import { X } from "lucide-react";
import { ChannelPill } from "@/components/home/film-card/channel-pill";
import { FilmCard } from "@/components/home/film-card";
import { RollSkeleton } from "@/components/browse/roll-skeleton";
import { formatFilmYear } from "@/lib/format/format-film-year";
import { cn } from "@/lib/utils/cn";
import type { RollFilm } from "@/lib/api";
import type { BrowseRollError } from "@/hooks/useBrowseRoll";

/**
 * The roll result, in the page, between the results header and the grid.
 *
 * It sits below the header on purpose: the Roll button lives up there and must
 * not move under the cursor that just pressed it. So the panel only ever pushes
 * the grid down, and the control that opened it stays exactly where it was —
 * which is also the control that rolls again, so the panel needs no filled
 * accent button of its own competing for the same act. Its own primary, View
 * details, is outlined in the accent instead and lives inside the card, at the
 * head of the control rail.
 *
 * Pushing the grid down is only worth doing if the grid survives it. A panel
 * that runs 700px has not kept the results in view, it has replaced them — which
 * is what a dialog would have done, at less cost. Everything here is measured
 * against that: the card is one band and two columns, its own footer is gone,
 * and what is left is the draw, the way onward into the film, and a dismiss.
 */
export function BrowseRollPanel({
  open,
  rolling,
  film,
  error,
  returnFocusRef,
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
  /** Where keyboard focus goes when the panel closes — the Roll button that
   *  opened it, rather than the top of the document. */
  returnFocusRef?: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  /** Draws again — "not tonight" is the only card signal that rolls onward. */
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
  const wasOpen = useRef(false);

  // Once, on opening — not on every draw. Re-running it per film pulled the page
  // out from under anyone who had scrolled into the grid to compare the draw
  // against the results it came from.
  useEffect(() => {
    if (open && !wasOpen.current) {
      panelRef.current?.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "nearest",
      });
      // Non-modal, so focus is offered rather than trapped: the panel itself
      // takes it, and Tab from there walks its contents in order.
      panelRef.current?.focus({ preventScroll: true });
    }

    wasOpen.current = open;
  }, [open, reducedMotion]);

  /** What a screen reader is told, which is otherwise nothing: the panel is not
   *  a dialog, so its arrival and the film inside it go unannounced. */
  const announcement = rolling
    ? "Rolling a film"
    : film
      ? `Rolled ${film.title}${formatFilmYear(film) ? `, ${formatFilmYear(film)}` : ""}`
      : error === "empty"
        ? "No films match these filters"
        : error
          ? "The roll failed"
          : "";

  return (
    // Focus goes back to Roll once the panel is actually gone, not when it is
    // asked to close: closing drops `?roll=` from the URL, and the router's own
    // navigation moves focus to the document body some frames after the state
    // change — anything focused before that lost it again immediately.
    <AnimatePresence initial={false} onExitComplete={() => returnFocusRef?.current?.focus()}>
      {open && (
        <motion.section
          ref={panelRef}
          key="roll-panel"
          tabIndex={-1}
          aria-label="Your roll"
          // Opacity and a short slide only. Animating `height: auto` on a panel
          // this size relaid out the whole page on every frame of every open.
          initial={reducedMotion ? false : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
          transition={{ duration: reducedMotion ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
          onKeyDown={(event) => {
            if (event.key === "Escape") onClose();
          }}
          className={cn(
            "mb-6 rounded-2xl border border-edge bg-ink-850 outline-none",
            "shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset]",
            "focus-visible:ring-2 focus-visible:ring-accent-soft/40",
          )}
        >
          <p role="status" aria-live="polite" className="sr-only">
            {announcement}
          </p>

          <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-2.5">
            {/* The channel alone, without the film's name: the title is set in
                display type 40px below, and the tag could only ever hold a
                clipped copy of it — "REEL // TO BE OR NO" for a film called To
                Be or Not to Be.

                No placeholder tag while rolling either: the skeleton below
                already says a film is coming. */}
            <div className="flex min-h-[26px] min-w-0 flex-1 items-center">
              {film && !rolling && <ChannelPill />}
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Dismiss roll"
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-fg-muted",
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
                <RollSkeleton />
              </motion.div>
            ) : film ? (
              /* Keyed by film id so the card remounts per roll: its action state
                 (seen, saved, the sentiment prompt) belongs to one film and must
                 not carry over to the next one drawn into the same panel. */
              <motion.div
                key={film.id}
                initial={{ opacity: 0, y: reducedMotion ? 0 : 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, transition: { duration: reducedMotion ? 0 : 0.12 } }}
                transition={{ duration: reducedMotion ? 0 : 0.2 }}
              >
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
                <p className="text-sm text-fg">
                  {error === "empty" ? "No films match these filters." : "The roll didn't come back."}
                </p>
                <p className="text-[13px] leading-[1.6] text-fg-muted">
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
                    className="mt-1 font-[family-name:var(--font-geist-mono)] text-[12px] text-fg-dim underline decoration-white/25 underline-offset-4 transition-colors hover:text-accent-soft"
                  >
                    Clear all filters
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
