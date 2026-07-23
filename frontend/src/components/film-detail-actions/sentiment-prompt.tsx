import { AnimatePresence, motion } from "framer-motion";
import { ThumbsDown, ThumbsUp, X } from "lucide-react";
import type { Sentiment } from "@/hooks/film-actions/types";
import { SentimentButton } from "@/components/film-detail-actions/sentiment-button";

/** One-tap 👍 / 👎 prompt, revealed after the film is marked watched. */
export function SentimentPrompt({
  visible,
  sentiment,
  pending,
  onLike,
  onDislike,
  onDismiss,
}: {
  visible: boolean;
  sentiment: Sentiment;
  pending: boolean;
  onLike: () => void;
  onDislike: () => void;
  onDismiss: () => void;
}) {
  return (
    <AnimatePresence initial={false}>
      {visible && (
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
              disabled={pending}
              onClick={onLike}
              icon={<ThumbsUp className="h-4 w-4" aria-hidden />}
              label="Liked it"
            />
            <SentimentButton
              tone="dislike"
              active={sentiment === "dislike"}
              disabled={pending}
              onClick={onDislike}
              icon={<ThumbsDown className="h-4 w-4" aria-hidden />}
              label="Disliked it"
            />
            <button
              type="button"
              aria-label="Dismiss"
              onClick={onDismiss}
              className="ml-auto shrink-0 text-white/35 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
