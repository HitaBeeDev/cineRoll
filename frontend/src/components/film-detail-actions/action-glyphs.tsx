"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Check,
  Eye,
  EyeOff,
  Heart,
  ThumbsDown,
  ThumbsUp,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { HoverTooltip } from "@/components/hover-tooltip";
import { ShareButton } from "@/components/share-button";
import { GlyphButton } from "@/components/film-detail-actions/glyph-button";
import { RatingGlyph } from "@/components/film-detail-actions/rating-glyph";
import { SHARE_GLYPH } from "@/components/film-detail-actions/styles/share-glyph";
import type {
  FilmActionState,
  Sentiment,
  SentimentChoice,
} from "@/hooks/film-actions/types";

// Watched fills solid in affirm green — the colour this app already uses for a
// recorded personal fact (the film card's quick actions and sentiment buttons
// both light up in it). The hero is simply catching up with the rest of the app.
//
// It was gold, and gold is the accolade colour: the medallions sit inches above
// this row, so a gold disc here asked the reader to hold two meanings for one
// colour in a single viewport. Gold now means award and nothing else.
//
// The fill still has to lose the brightness contest to Watch Trailer, and it
// does — affirm's luminance sits under white's, the same reason gold was chosen
// over the original pure white. Dark ink on affirm clears 7:1.
const WATCHED_ACTIVE =
  "border-affirm bg-affirm text-ink-950 hover:bg-affirm/90";

// The three verdicts climb a ladder of emphasis rather than picking three
// unrelated colours: quiet ring → white ring → the brand coral. Read left to
// right, the row shows how much you liked something without reading the icons.
//
// Coral is the site's accent and the top of the viewer's own scale, so the ring
// runs a step hotter than the watchlist's saved state (/70 and /20 against /50
// and /15) and the heart fills solid. The filled shape is what separates the two
// at a glance — the watchlist is a labelled rectangle, this is a full heart.
const LOVED_ACTIVE =
  "border-accent/70 bg-accent/20 text-accent hover:bg-accent/25";

const LIKED_ACTIVE = "border-white/60 bg-white/[0.12] text-white";

// Negative states don't get to glow. Both hiding a film and disliking it settle
// into the same quiet lit ring; the glyph itself says which one happened.
const QUIET_ACTIVE = "border-white/30 bg-white/[0.10] text-white/70";

const GLYPH = "h-4 w-4";

// Weakest to strongest, left to right. The order is data so the row can't drift
// out of sync with the ladder of emphasis the classes above describe.
//
// Three rungs, not four: there is no "it was fine" button because a watched film
// with nothing selected already says exactly that, and the recommender already
// weights it (SENTIMENT_WEIGHT.watchedNeutral). An explicit neutral would cost a
// slot in the row and buy a signal we hold either way.
const RATING_LADDER: readonly {
  value: SentimentChoice;
  label: string;
  activeClassName: string;
  Icon: LucideIcon;
  fillWhenActive: boolean;
  /** Only the heart pops. See RatingGlyph for why it's the one that does. */
  pop: boolean;
}[] = [
  {
    value: "dislike",
    label: "Didn't like it",
    activeClassName: QUIET_ACTIVE,
    Icon: ThumbsDown,
    fillWhenActive: false,
    pop: false,
  },
  {
    value: "like",
    label: "Liked it",
    activeClassName: LIKED_ACTIVE,
    Icon: ThumbsUp,
    fillWhenActive: false,
    pop: false,
  },
  {
    value: "love",
    label: "Loved it",
    activeClassName: LOVED_ACTIVE,
    Icon: Heart,
    fillWhenActive: true,
    pop: true,
  },
];

/**
 * The hero's circular glyph cluster.
 *
 * Two rules hold the layout still. Only one meaning per glyph: hiding a film
 * uses an eye, never the thumbs-down that means "I watched it and didn't care
 * for it", so the two can never appear side by side reading as the same thing.
 * And the set only ever grows sideways: marking a film watched retires the
 * hide glyph and admits the rating glyphs in its place, so nothing below the
 * cursor moves the moment it's clicked. Five glyphs is the ceiling that keeps
 * that true on one line — ✓ · 👎 · 👍 · ♥ · share.
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
  onRate,
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
  onRate: (value: SentimentChoice) => void;
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
            {/* "How was it?" reads like a question you owe an answer to. "Rate
                it?" offers rather than asks, which matches the truth: leaving
                this alone is a valid, recorded outcome. */}
            Rate it?
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

      {/* The rating glyphs and the hide glyph share a slot, and neither animates
          out — they animate IN and vanish on the spot.

          Both alternatives were worse. Fading them out holds their slot while
          they go, so for ~180ms the row carries six items and bounces onto a
          second line and back. AnimatePresence's popLayout fixes the width by
          taking the leaver out of the flow, but then it sits on top of the glyph
          arriving in its place. An instant swap keeps the promise that matters:
          the row only ever grows sideways, and nothing under the cursor moves. */}
      {watched &&
          RATING_LADDER.map((rung, index) => (
            <motion.div
              key={rung.value}
              initial={enter}
              animate={settled}
              transition={{ duration: 0.18, delay: reduceMotion ? 0 : index * 0.05 }}
              className="shrink-0"
            >
              <GlyphButton
                label={rung.label}
                active={sentiment === rung.value}
                activeClassName={rung.activeClassName}
                disabled={sentimentPending}
                onClick={() => onRate(rung.value)}
              >
                {/* Only the heart fills. A verdict you feel strongly enough to
                    call love should look different in kind, not just colour. */}
                <RatingGlyph
                  Icon={rung.Icon}
                  active={sentiment === rung.value}
                  pop={rung.pop}
                  fillWhenActive={rung.fillWhenActive}
                  className={GLYPH}
                />
              </GlyphButton>
            </motion.div>
          ))}

      {/* Nothing to hide once you've seen it, so this glyph only exists while
          the decision is still open. */}
      {!watched && (
          <motion.div
            key="hide"
            initial={enter}
            animate={settled}
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

      {/* Set apart from the ladder: the extra left margin doubles the cluster's
          own gap, which is the break that stops share reading as a rating. */}
      <span className="ml-2.5 inline-flex">
        <HoverTooltip label="Share">
          <ShareButton
            url={shareUrl}
            title={shareTitle}
            caption={shareCaption}
            label=""
            ariaLabel="Share this film"
            iconClassName="h-3.5 w-3.5"
            className={SHARE_GLYPH}
          />
        </HoverTooltip>
      </span>
    </div>
  );
}
