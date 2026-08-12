"use client";

import { useState } from "react";
import { AnimatePresence, useReducedMotion } from "framer-motion";
import { usePwaInstall } from "@/components/pwa-install-prompt/usePwaInstall";
import { InstallPromptBar } from "@/components/pwa-install-prompt/install-prompt-bar";
import { InstallPromptCard } from "@/components/pwa-install-prompt/install-prompt-card";

/**
 * Two states, and which one you get is the reader's call: a one-line bar that
 * stays out of the way, and — on iOS, where installing is a gesture the browser
 * has to be told about — the full card it opens.
 */
export function PwaInstallPrompt() {
  const reduced = useReducedMotion() ?? false;
  const { platform, visible, install, dismiss } = usePwaInstall();
  const [expanded, setExpanded] = useState(false);

  const close = () => setExpanded(false);

  return (
    <>
      <AnimatePresence>
        {visible && platform && !expanded && (
          <InstallPromptBar
            platform={platform}
            reduced={reduced}
            onInstall={() => void install()}
            onExpand={() => setExpanded(true)}
            onDismiss={dismiss}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {visible && expanded && <InstallPromptCard reduced={reduced} onClose={close} />}
      </AnimatePresence>
    </>
  );
}
