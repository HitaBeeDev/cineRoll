import { motion } from "framer-motion";
import { ThumbsDown, ThumbsUp, X } from "lucide-react";
import { SentimentButton } from "@/components/home/film-card/sentiment-button";
import type { FilmSentiment } from "@/lib/api/sentiment";

/**
 * The one-tap 👍/👎 prompt revealed after a film is marked watched.
 * Dismissible; the caller controls mount/unmount via AnimatePresence.
 *
 * Deliberately two levels where the film page offers three. The roll card is a
 * triage surface — the film is on its way off screen — so it asks the cheapest
 * useful question. "Loved it" is available on the film page, where you've chosen
 * to linger. A film already loved still reads as positive here.
 */
export function SentimentPrompt({
  value,
  pending,
  onSelect,
  onDismiss,
}: {
  value: FilmSentiment | null;
  pending?: boolean;
  onSelect: (value: "like" | "dislike") => void;
  onDismiss: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden"
    >
      <div className="mt-2 flex items-center justify-between gap-3 rounded-xl border border-edge bg-ink-850 px-3 py-2.5">
        <span className="font-[family-name:var(--font-geist-mono)] text-[12px] font-bold uppercase tracking-[0.18em] text-fg-muted">
          How was it?
        </span>
        <div className="flex items-center gap-2">
          <SentimentButton
            tone="like"
            // Love counts as a thumbs-up on this surface: it can't be set here,
            // but a film rated on the film page must not come back looking blank.
            active={value === "like" || value === "love"}
            disabled={pending}
            onClick={() => onSelect("like")}
            icon={<ThumbsUp className="h-4 w-4" aria-hidden />}
            label="Liked it"
          />
          <SentimentButton
            tone="dislike"
            active={value === "dislike"}
            disabled={pending}
            onClick={() => onSelect("dislike")}
            icon={<ThumbsDown className="h-4 w-4" aria-hidden />}
            label="Disliked it"
          />
          <button
            type="button"
            aria-label="Dismiss"
            onClick={onDismiss}
            className="ml-1 shrink-0 text-fg-muted transition-colors hover:text-fg-hi focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
