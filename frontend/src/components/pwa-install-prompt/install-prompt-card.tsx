import Image from "next/image";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { ValuePropsList } from "@/components/pwa-install-prompt/value-props-list";
import { IosInstallSteps } from "@/components/pwa-install-prompt/ios-install-steps";

/**
 * The full case for installing: branded header, value props, and the manual
 * Share → "Add to Home Screen" gesture that iOS gives no event for.
 *
 * Only ever opened by the reader, from the bar — which is what earns it the
 * space and the layer. Unasked-for, this same card sat over the page at
 * `z-[95]`, covering half a phone screen and swallowing taps meant for the
 * controls beneath it; asked for, it is allowed to be the thing in front, with a
 * backdrop that says so and closes it.
 *
 * Android never sees this: there, the bar's button calls the browser's own
 * install dialog, and a page explaining how to do what the browser is about to
 * do for you is a page nobody needs.
 */
export function InstallPromptCard({
  reduced,
  onClose,
}: {
  reduced: boolean;
  onClose: () => void;
}) {
  return (
    <>
      <motion.div
        aria-hidden
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[65] bg-black/70 backdrop-blur-[2px]"
      />

      <motion.div
        role="dialog"
        aria-modal
        aria-label="Add CineRoll to your home screen"
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
        animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
        exit={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        className="fixed inset-x-3 bottom-3 z-[70] mx-auto max-w-md rounded-2xl border border-[#2a2a3e] bg-[#0d0d1a]/97 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-md"
        style={{ marginBottom: "env(safe-area-inset-bottom)" }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 rounded-full p-1 text-[#8a8a9e] transition-colors hover:bg-white/5 hover:text-[#F5F5F0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>

        {/* Header — app icon + branded kicker + title */}
        <div className="flex items-center gap-4 pr-6">
          <div className="shrink-0 overflow-hidden rounded-2xl border border-[#1e1e2a] bg-[#09090f] shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
            <Image src="/icon-192.png" alt="CineRoll" width={56} height={56} className="h-14 w-14" />
          </div>
          <div className="min-w-0">
            <p className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.28em] text-[#e8453c]/80">
              {"// install"}
            </p>
            <h2 className="mt-1 font-[family-name:var(--font-display)] text-xl font-bold leading-tight text-[#F5F5F0]">
              Add CineRoll to your home screen
            </h2>
          </div>
        </div>

        <ValuePropsList />
        <IosInstallSteps />
      </motion.div>
    </>
  );
}
