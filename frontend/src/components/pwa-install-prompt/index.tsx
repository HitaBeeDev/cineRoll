"use client";

import { AnimatePresence, useReducedMotion } from "framer-motion";
import { usePwaInstall } from "@/components/pwa-install-prompt/usePwaInstall";
import { InstallPromptCard } from "@/components/pwa-install-prompt/install-prompt-card";

export function PwaInstallPrompt() {
  const reduced = useReducedMotion() ?? false;
  const { platform, visible, install, dismiss } = usePwaInstall();

  return (
    <AnimatePresence>
      {visible && platform && (
        <InstallPromptCard
          platform={platform}
          reduced={reduced}
          onInstall={() => void install()}
          onDismiss={dismiss}
        />
      )}
    </AnimatePresence>
  );
}
