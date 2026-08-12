"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Eye, EyeOff, ThumbsDown, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { HoverTooltip } from "@/components/hover-tooltip";
import { ShareButton } from "@/components/share-button";
import { GlyphButton } from "@/components/film-detail-actions/glyph-button";
import { GLYPH_BUTTON } from "@/components/film-detail-actions/styles/glyph-button";
import { GLYPH_IDLE } from "@/components/film-detail-actions/styles/glyph-idle";
import type { FilmActionState, Sentiment } from "@/hooks/film-actions/types";

// Watched inverts to the only solid white surface on the hero, which makes it
// the brightest thing on the page. That is the right emphasis: of everything
// here, "I have seen this" is the one fact that belongs to the viewer.
const WATCHED_ACTIVE = "border-white bg-white text-[#0d0d14] hover:bg-white/90";

// A thumbs-up is the viewer's own award for the film, so it lights in the same
// gold as the accolades it sits under. No new hue enters the palette.
const LIKED_ACTIVE =
  "border-[#d4af37]/60 bg-[#d4af37]/15 text-[#d4af37] hover:bg-[#d4af37]/20";

// Negative states don't get to glow. Both hiding a film and disliking it settle
// into the same quiet lit ring; the glyph itself says which one happened.
const QUIET_ACTIVE = "border-white/30 bg-white/[0.10] text-white/70";

const GLYPH = "h-4 w-4";

/**
 * The hero's circular glyph cluster.
 *
 * Two rules hold the layout still. Only one meaning per glyph: hiding a film
 * uses an eye, never the thumbs-down that means "I watched it and didn't care
 * for it", so the two can never appear side by side reading as the same thing.
 * And the set only ever grows sideways: marking a film watched retires the
 * hide glyph and admits the two rating glyphs in its place, so nothing below
 * the cursor moves the moment it's clicked.
 */
export function ActionGlyphs({
  action,
  pending,
  sentiment,
  sentimentPending,
  shareUrl,
  shareTitle,
  shareCaption,
  onMarkWatched,
  onNotInterested,
  onLike,
  onDislike,
}: {
  action: FilmActionState;
  pending: boolean;
  sentiment: Sentiment;
  sentimentPending: boolean;
  shareUrl: string;
  shareTitle: string;
  shareCaption: string;
  onMarkWatched: () => void;
  onNotInterested: () => void;
  onLike: () => void;
  onDislike: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const watched = action === "watched";
  const hidden = action === "not-interested";
  // Asked once, and only until it's answered — the lit glyph is the answer, so
  // the question has no reason to keep standing there afterwards.
  const asking = watched && sentiment === null;

  // Opacity and scale only. Animating the width so the row slid open read
  // nicely in theory and collapsed the glyphs into each other in practice; the
  // flex gap already handles the spacing, and the row is free to grow sideways.
  const enter = reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.85 };
  const settled = reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 };

  return (
    <div
      className={cn(
        "relative flex items-center gap-2.5",
        // The label is absolute, so it never moves the row. On a narrow screen
        // the cluster wraps to its own line and the label would otherwise sit
        // on top of the button above it, so there it takes real space.
        asking && "mt-5 sm:mt-0",
      )}
    >
      <AnimatePresence>
        {asking && (
          <motion.span
            aria-hidden
            initial={{ opacity: 0, y: reduceMotion ? 0 : 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, delay: reduceMotion ? 0 : 0.1 }}
            className="absolute bottom-full left-0 mb-2 whitespace-nowrap font-[family-name:var(--font-geist-mono)] text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45"
          >
            How was it?
          </motion.span>
        )}
      </AnimatePresence>

      <GlyphButton
        label={watched ? "Undo watched" : "Mark watched"}
        active={watched}
        activeClassName={WATCHED_ACTIVE}
        disabled={pending}
        onClick={onMarkWatched}
      >
        <Check className={GLYPH} aria-hidden />
      </GlyphButton>

      {/* The rating pair and the hide glyph occupy the same slot, each in its
          own presence block — one ternary handing AnimatePresence sometimes an
          array and sometimes an element confuses its child bookkeeping. */}
      <AnimatePresence initial={false}>
        {watched &&
          [
            {
              key: "like",
              label: "Liked it",
              active: sentiment === "like",
              activeClassName: LIKED_ACTIVE,
              onClick: onLike,
              icon: <ThumbsUp className={GLYPH} aria-hidden />,
            },
            {
              key: "dislike",
              label: "Didn't like it",
              active: sentiment === "dislike",
              activeClassName: QUIET_ACTIVE,
              onClick: onDislike,
              icon: <ThumbsDown className={GLYPH} aria-hidden />,
            },
          ].map((glyph, index) => (
            <motion.div
              key={glyph.key}
              initial={enter}
              animate={settled}
              exit={enter}
              transition={{ duration: 0.18, delay: reduceMotion ? 0 : index * 0.05 }}
              className="shrink-0"
            >
              <GlyphButton
                label={glyph.label}
                active={glyph.active}
                activeClassName={glyph.activeClassName}
                disabled={sentimentPending}
                onClick={glyph.onClick}
              >
                {glyph.icon}
              </GlyphButton>
            </motion.div>
          ))}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {/* Nothing to hide once you've seen it, so this glyph only exists while
            the decision is still open. */}
        {!watched && (
          <motion.div
            key="hide"
            initial={enter}
            animate={settled}
            exit={enter}
            transition={{ duration: 0.18 }}
            className="shrink-0"
          >
            <GlyphButton
              label={hidden ? "Undo hidden" : "Not interested"}
              active={hidden}
              activeClassName={QUIET_ACTIVE}
              disabled={pending}
              onClick={onNotInterested}
            >
              {/* The icon carries the state change on its own — an open eye
                  means the film is hidden and clicking gives it back. */}
              {hidden ? (
                <Eye className={GLYPH} aria-hidden />
              ) : (
                <EyeOff className={GLYPH} aria-hidden />
              )}
            </GlyphButton>
          </motion.div>
        )}
      </AnimatePresence>

      <HoverTooltip label="Share">
        <ShareButton
          url={shareUrl}
          title={shareTitle}
          caption={shareCaption}
          label=""
          ariaLabel="Share this film"
          iconClassName={GLYPH}
          className={cn(GLYPH_BUTTON, GLYPH_IDLE)}
        />
      </HoverTooltip>
    </div>
  );
}
