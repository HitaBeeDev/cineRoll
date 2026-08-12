import Image from "next/image";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import type { Platform } from "@/components/pwa-install-prompt/types";

/**
 * The install offer at rest: one line, one action, one way out.
 *
 * It used to be the full card — icon, three value props, and a platform block —
 * which came to 372px on a 664px phone and was pinned above everything at
 * `z-[95]`. On /browse that landed squarely on the filter bar: Berlinale, the
 * whole award-result control and the Advanced button all took taps that went to
 * an install ad instead, so the page read as simply broken. An unsolicited offer
 * cannot be the top layer of the app.
 *
 * So it is a bar, and it sits at `z-30` — under the sticky filter bar (z-40),
 * the app header (z-50) and every sheet, drawer and dialog above those. Anything
 * it overlaps now paints over it, and when a full-screen sheet is open the bar is
 * simply behind it. The case for installing is still made in full; it is one tap
 * away in the expanded card rather than in the way.
 */
export function InstallPromptBar({
  platform,
  reduced,
  onInstall,
  onExpand,
  onDismiss,
}: {
  platform: Platform;
  reduced: boolean;
  /** Android only — fires the browser's own install dialog. */
  onInstall: () => void;
  /** iOS has no install event, so the bar opens the steps instead. */
  onExpand: () => void;
  onDismiss: () => void;
}) {
  const android = platform === "android";

  return (
    <motion.div
      // A region, not a dialog: it blocks nothing, traps nothing, and calling it
      // a dialog told a screen reader it had to be dealt with before the page.
      role="region"
      aria-label="Add CineRoll to your home screen"
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
      animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="fixed inset-x-3 bottom-3 z-30 mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-[#2a2a3e] bg-[#0d0d1a]/97 px-3 py-2.5 shadow-[0_16px_40px_rgba(0,0,0,0.55)] backdrop-blur-md"
      style={{ marginBottom: "env(safe-area-inset-bottom)" }}
    >
      <Image
        src="/icon-192.png"
        alt=""
        aria-hidden
        width={36}
        height={36}
        className="h-9 w-9 shrink-0 rounded-lg border border-[#1e1e2a]"
      />

      <p className="min-w-0 flex-1 text-[13px] leading-[1.3] text-[#F5F5F0]">
        Add CineRoll to your home screen
      </p>

      <button
        type="button"
        onClick={android ? onInstall : onExpand}
        className="shrink-0 rounded-lg bg-[#e8453c] px-3 py-2 font-[family-name:var(--font-geist-mono)] text-[12px] font-bold text-[#09090f] transition-colors hover:bg-[#ff5c52] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff766d]"
      >
        {android ? "Add" : "How"}
      </button>

      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="-mr-1 shrink-0 rounded-full p-1.5 text-[#8a8a9e] transition-colors hover:bg-white/5 hover:text-[#F5F5F0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
    </motion.div>
  );
}
