"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bookmark, Check, ThumbsDown, ThumbsUp, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useFilmActions, AUTH_GATE_TITLE } from "@/hooks/useFilmActions";
import { HoverTooltip } from "@/components/hover-tooltip";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { SaveToListButton } from "@/components/save-to-list-dialog";
import { cn } from "@/lib/utils";

const HERO_BUTTON_BASE =
  "flex h-12 items-center border font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.2em] backdrop-blur-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c] disabled:cursor-not-allowed disabled:opacity-60";

// Secondary action (Watchlist): a solid, clearly-bordered surface — distinctly
// the next-most-important choice after the primary "Watch Trailer", and a step
// above the ghost icon cluster.
const SECONDARY_BUTTON = `${HERO_BUTTON_BASE} gap-2 px-5`;
const SECONDARY_IDLE =
  "border-white/30 bg-white/[0.12] text-white hover:border-white/45 hover:bg-white/[0.18]";

// Tertiary, low-intent actions (Watched / Not Interested): ghost icon squares,
// near-invisible until hover so they sit clearly below the labelled buttons.
const ICON_BUTTON = `${HERO_BUTTON_BASE} w-12 justify-center`;
const ICON_IDLE =
  "border-white/10 bg-transparent text-white/45 hover:border-white/25 hover:bg-white/[0.06] hover:text-white";

/**
 * The post-roll action set, rendered on the film detail hero. Shares all
 * behaviour with the roll card via `useFilmActions`; only the layout differs.
 * Returns a fragment so the buttons sit in the hero's flex-wrap row and the
 * sentiment prompt wraps onto its own line.
 */
export function FilmDetailActions({
  filmId,
  filmTitle,
}: {
  filmId: string;
  filmTitle: string;
}) {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const pathname = usePathname();

  const {
    action,
    pending,
    sentiment,
    sentimentDismissed,
    sentimentPending,
    dismissSentiment,
    inWatchlist,
    watchlistPending,
    saveDecision,
    saveSentiment,
    toggleWatchlist,
    authPrompt,
    closeAuthPrompt,
  } = useFilmActions({
    filmId,
    filmTitle,
    isAuthenticated,
    source: "film_detail",
  });

  return (
    <>
      {/* Secondary: save to watchlist */}
      <button
        type="button"
        aria-pressed={inWatchlist}
        disabled={watchlistPending}
        onClick={() => void toggleWatchlist()}
        className={cn(
          SECONDARY_BUTTON,
          inWatchlist
            ? "border-[#e8453c]/50 bg-[#e8453c]/15 text-white"
            : SECONDARY_IDLE,
        )}
      >
        <Bookmark
          className="h-3.5 w-3.5"
          fill={inWatchlist ? "currentColor" : "none"}
          aria-hidden
        />
        {inWatchlist ? "Saved" : "Watchlist"}
      </button>

      {/* Save to a custom list — same secondary weight as the watchlist button. */}
      <SaveToListButton
        filmId={filmId}
        filmTitle={filmTitle}
        isAuthenticated={isAuthenticated}
        className={cn(SECONDARY_BUTTON, SECONDARY_IDLE)}
      />

      {/* Divider: the visual boundary between the two action groups — labelled
          primary CTAs (Watch Trailer / Watchlist) on the left, quiet utility
          icons (Watched / Not Interested / Share) on the right. Margins widen
          the boundary so the split reads as intentional grouping. */}
      <span
        aria-hidden
        className="mx-1.5 hidden h-8 w-px self-center bg-white/20 sm:block"
      />

      {/* Tertiary icon row: lower-intent actions, visually quiet. Each carries
          a hover/focus label so the icons aren't a guessing game. */}
      <div className="flex items-center gap-2.5">
        <HoverTooltip label={action === "watched" ? "Watched" : "Mark watched"}>
          <button
            type="button"
            aria-pressed={action === "watched"}
            aria-label={action === "watched" ? "Marked watched" : "Mark watched"}
            disabled={pending}
            onClick={() => void saveDecision("watched", false)}
            className={cn(
              ICON_BUTTON,
              action === "watched"
                ? "border-[#3fb950]/50 bg-[#3fb950]/15 text-[#7ee787]"
                : ICON_IDLE,
            )}
          >
            <Check className="h-4 w-4" aria-hidden />
          </button>
        </HoverTooltip>

        <HoverTooltip
          label={action === "not-interested" ? "Hidden" : "Not interested"}
        >
          <button
            type="button"
            aria-pressed={action === "not-interested"}
            aria-label={action === "not-interested" ? "Hidden" : "Not interested"}
            disabled={pending}
            onClick={() => void saveDecision("not-interested", true)}
            className={cn(
              ICON_BUTTON,
              action === "not-interested"
                ? "border-[#e8453c]/50 bg-[#e8453c]/12 text-[#e8453c]"
                : ICON_IDLE,
            )}
          >
            <ThumbsDown className="h-4 w-4" aria-hidden />
          </button>
        </HoverTooltip>
      </div>

      {/* Guest auth gate: a guest tapping Watched / Watchlist raises the sign-in
          modal. Their action is stashed and replayed when they return. */}
      <AuthDialog
        open={authPrompt !== null}
        onOpenChange={(open) => {
          if (!open) closeAuthPrompt();
        }}
        callbackUrl={pathname}
        title={authPrompt ? AUTH_GATE_TITLE[authPrompt] : undefined}
      />

      {/* One-tap 👍 / 👎 prompt, revealed after the film is marked watched. */}
      <AnimatePresence initial={false}>
        {action === "watched" && !sentimentDismissed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full overflow-hidden"
          >
            <div className="flex items-center gap-3 border border-white/14 bg-white/6 px-5 py-3 backdrop-blur-sm">
              <span className="font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.18em] text-white/50">
                How was it?
              </span>
              <SentimentButton
                tone="like"
                active={sentiment === "like"}
                disabled={sentimentPending}
                onClick={() => void saveSentiment("like")}
                icon={<ThumbsUp className="h-4 w-4" aria-hidden />}
                label="Liked it"
              />
              <SentimentButton
                tone="dislike"
                active={sentiment === "dislike"}
                disabled={sentimentPending}
                onClick={() => void saveSentiment("dislike")}
                icon={<ThumbsDown className="h-4 w-4" aria-hidden />}
                label="Disliked it"
              />
              <button
                type="button"
                aria-label="Dismiss"
                onClick={dismissSentiment}
                className="ml-auto shrink-0 text-white/35 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function SentimentButton({
  tone,
  active,
  disabled,
  onClick,
  icon,
  label,
}: {
  tone: "like" | "dislike";
  active: boolean;
  disabled?: boolean | undefined;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  const toneClasses =
    tone === "like"
      ? active
        ? "border-[#3fb950]/50 bg-[#3fb950]/15 text-[#7ee787]"
        : "border-white/14 text-white/50 hover:border-[#3fb950]/45 hover:text-[#7ee787]"
      : active
        ? "border-[#e8453c]/50 bg-[#e8453c]/12 text-[#e8453c]"
        : "border-white/14 text-white/50 hover:border-[#e8453c]/45 hover:text-[#e8453c]";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className={cn(
        "flex h-9 w-9 items-center justify-center border transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
        "disabled:cursor-not-allowed disabled:opacity-60",
        toneClasses,
      )}
    >
      {icon}
    </button>
  );
}
