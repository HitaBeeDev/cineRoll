import { motion } from "framer-motion";
import { ThumbsDown, ThumbsUp, X } from "lucide-react";
import { SentimentButton } from "@/components/home/film-card/sentiment-button";

/** The one-tap 👍/👎 prompt revealed after a film is marked watched.
 *  Dismissible; the caller controls mount/unmount via AnimatePresence. */
export function SentimentPrompt({
  value,
  pending,
  onSelect,
  onDismiss,
}: {
  value: "like" | "dislike" | null;
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
      <div className="mt-2 flex items-center justify-between gap-3 rounded-xl border border-[#1e1e2a] bg-[#0d0d1a] px-3 py-2.5">
        <span className="font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.18em] text-[#888899]">
          How was it?
        </span>
        <div className="flex items-center gap-2">
          <SentimentButton
            tone="like"
            active={value === "like"}
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
            className="ml-1 shrink-0 text-[#888899] transition-colors hover:text-[#F5F5F0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
