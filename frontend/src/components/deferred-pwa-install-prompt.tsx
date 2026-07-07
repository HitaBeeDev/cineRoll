"use client";

import dynamic from "next/dynamic";

const LazyPwaInstallPrompt = dynamic(
  () =>
    import("@/components/pwa-install-prompt").then(
      (module) => module.PwaInstallPrompt,
    ),
  { ssr: false },
);

export function DeferredPwaInstallPrompt() {
  return <LazyPwaInstallPrompt />;
}
