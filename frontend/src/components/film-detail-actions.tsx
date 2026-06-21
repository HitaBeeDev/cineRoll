"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bookmark, Check, ThumbsDown, ThumbsUp, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useFilmActions } from "@/hooks/useFilmActions";
import { cn } from "@/lib/utils";

const HERO_BUTTON_BASE =
  "flex h-12 items-center gap-2 border px-5 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.2em] backdrop-blur-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c] disabled:cursor-not-allowed disabled:opacity-60";

const HERO_BUTTON_IDLE =
  "border-white/14 bg-white/6 text-white/50 hover:bg-white/10 hover:text-white/75";

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
  } = useFilmActions({
    filmId,
    filmTitle,
    isAuthenticated,
    source: "film_detail",
  });

  return (
    <>
      <button
        type="button"
        aria-pressed={inWatchlist}
        disabled={watchlistPending}
        onClick={() => void toggleWatchlist()}
        className={cn(
          HERO_BUTTON_BASE,
          inWatchlist
            ? "border-[#e8453c]/50 bg-[#e8453c]/15 text-white"
            : HERO_BUTTON_IDLE,
        )}
      >
        <Bookmark
          className="h-3.5 w-3.5"
          fill={inWatchlist ? "currentColor" : "none"}
          aria-hidden
        />
        {inWatchlist ? "Saved" : "Watchlist"}
      </button>

      <button
        type="button"
        aria-pressed={action === "watched"}
        disabled={pending}
        onClick={() => void saveDecision("watched", false)}
        className={cn(
          HERO_BUTTON_BASE,
          action === "watched"
            ? "border-[#3fb950]/50 bg-[#3fb950]/15 text-[#7ee787]"
            : HERO_BUTTON_IDLE,
        )}
      >
        <Check className="h-3.5 w-3.5" aria-hidden />
        {action === "watched" ? "Watched ✓" : "Watched"}
      </button>

      <button
        type="button"
        aria-pressed={action === "not-interested"}
        disabled={pending}
        onClick={() => void saveDecision("not-interested", true)}
        className={cn(
          HERO_BUTTON_BASE,
          action === "not-interested"
            ? "border-[#e8453c]/50 bg-[#e8453c]/12 text-[#e8453c]"
            : HERO_BUTTON_IDLE,
        )}
      >
        <ThumbsDown className="h-3.5 w-3.5" aria-hidden />
        {action === "not-interested" ? "Hidden" : "Not Interested"}
      </button>

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
