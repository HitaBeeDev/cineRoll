"use client";

import dynamic from "next/dynamic";

const LABEL = "Report a correction";
const BUTTON_CLASS =
  "inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-medium text-fg-hi transition-colors hover:border-accent/60 hover:text-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60";

// Same lazy load as the footer's dialog; the placeholder matches the real button
// so nothing shifts when the dialog code arrives.
const LazyDialog = dynamic(
  () => import("@/components/site-feedback-dialog").then((module) => module.SiteFeedbackDialog),
  {
    loading: () => (
      <span className={BUTTON_CLASS} aria-disabled>
        {LABEL}
      </span>
    ),
    ssr: false,
  },
);

export function AboutFeedbackButton() {
  return <LazyDialog triggerLabel={LABEL} triggerClassName={BUTTON_CLASS} />;
}
