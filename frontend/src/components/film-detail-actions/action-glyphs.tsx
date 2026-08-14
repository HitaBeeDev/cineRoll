"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
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
import { WatchedPill } from "@/components/film-detail-actions/watched-pill";
import { GLYPH_BUTTON } from "@/components/film-detail-actions/styles/glyph-button";
import { GLYPH_IDLE } from "@/components/film-detail-actions/styles/glyph-idle";
import type {
  FilmActionState,
  Sentiment,
  SentimentChoice,
} from "@/hooks/film-actions/types";

// The three verdicts sit on one shell: a single pill holding three glyphs, the
// way a segmented control does. That shell is the whole point — it says these
// three are one question with three answers, and that the labelled Watched
// beside it is a different kind of thing (what happened, not how you felt).
//
// Horizontal padding only, so the group stands 42px against the pill's 40 and
// the row still reads as one line.
const LADDER_GROUP =
  "flex shrink-0 items-center gap-1 rounded-full border border-white/10 bg-black/25 px-1 backdrop-blur-sm";

// Inside the shell the glyphs drop their own ring and scrim — the group carries
// both — and light on hover against it instead.
const LADDER_IDLE =
  "border-transparent text-white/50 hover:bg-white/[0.10] hover:text-white";

// The three verdicts climb a ladder of emphasis rather than picking three
// unrelated colours: quiet → white ring → the brand coral. Read left to right,
// the row shows how much you liked something without reading the icons.
//
// Coral is the site's accent and the top of the viewer's own scale, so the ring
// runs a step hotter than the watchlist's saved state (/70 and /20 against /50
// and /15) and the heart fills solid. The filled shape is what separates the two
// at a glance — a bookmark is not a heart.
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
 * The hero's watched control and glyph cluster.
 *
 * The row reads as three things, not seven: the labelled fact (Watched), the
 * grouped opinion (the three-step ladder on its own shell), and then the two
 * loose glyphs that belong to neither — hiding the film, and sharing it.
 *
 * The ladder is rendered from the start, unlit. It used to appear only once a
 * film was marked watched, which meant the shape of the row changed under the
 * cursor at the exact moment someone was reaching into it, and the heart in
 * particular looked like a reward for clicking rather than the top of a scale
 * that had been there all along. Rating an unwatched film is a real answer —
 * the server records it as watched either way — so there is nothing to gate.
 *
 * What still changes: the hide glyph retires once a film is watched, because
 * there is nothing to hide once you have seen it. It sits after the ladder so
 * that when it goes, nothing to its left moves.
 *
 * One meaning per glyph holds throughout: hiding uses an eye, never the
 * thumbs-down that means "I watched it and didn't care for it", so the two can
 * never sit side by side reading as the same thing.
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
      <WatchedPill watched={watched} pending={pending} onToggle={onMarkWatched} />

      {/* One shell, three answers, and the invitation anchored over the shell
          rather than over the row — it is asking about these three and nothing
          else. `role="group"` with a name is what carries the "these belong
          together" reading to a screen reader, which cannot see the pill drawn
          around them. */}
      <div className="relative flex shrink-0">
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
              {/* "How was it?" reads like a question you owe an answer to.
                  "Rate it?" offers rather than asks, which matches the truth:
                  leaving this alone is a valid, recorded outcome. */}
              Rate it?
            </motion.span>
          )}
        </AnimatePresence>

        <div className={LADDER_GROUP} role="group" aria-label="Rate this film">
          {RATING_LADDER.map((rung) => (
            <GlyphButton
              key={rung.value}
              label={rung.label}
              active={sentiment === rung.value}
              activeClassName={rung.activeClassName}
              idleClassName={LADDER_IDLE}
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
          ))}
        </div>
      </div>

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

      {/* Set apart from the ladder by the gap alone: the extra left margin
          doubles the cluster's own, which is the break that stops share reading
          as a rating. It used to also drop the ring and shrink to 36px, and that
          cost more than it bought — a bare icon beside seven ringed ones reads
          as decoration rather than a control. Same ring, same size, different
          position. */}
      <span className="ml-2.5 inline-flex">
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
      </span>
    </div>
  );
}
