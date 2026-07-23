import Image from "next/image";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import type { Platform } from "@/components/pwa-install-prompt/types";
import { ValuePropsList } from "@/components/pwa-install-prompt/value-props-list";
import { AndroidInstallActions } from "@/components/pwa-install-prompt/android-install-actions";
import { IosInstallSteps } from "@/components/pwa-install-prompt/ios-install-steps";

/** The install dialog card: branded header, value props, and a platform-specific
 *  call to action (Android buttons or iOS steps). */
export function InstallPromptCard({
  platform,
  reduced,
  onInstall,
  onDismiss,
}: {
  platform: Platform;
  reduced: boolean;
  onInstall: () => void;
  onDismiss: () => void;
}) {
  return (
    <motion.div
      role="dialog"
      aria-label="Add CineRoll to your home screen"
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
      animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="fixed inset-x-3 bottom-3 z-[95] mx-auto max-w-md rounded-2xl border border-[#2a2a3e] bg-[#0d0d1a]/97 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-md"
      style={{ marginBottom: "env(safe-area-inset-bottom)" }}
    >
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="absolute right-3 top-3 rounded-full p-1 text-[#8a8a9e] transition-colors hover:bg-white/5 hover:text-[#F5F5F0]"
      >
        <X className="h-4 w-4" />
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

      {platform === "android" ? (
        <AndroidInstallActions onInstall={onInstall} onDismiss={onDismiss} />
      ) : (
        <IosInstallSteps />
      )}
    </motion.div>
  );
}
