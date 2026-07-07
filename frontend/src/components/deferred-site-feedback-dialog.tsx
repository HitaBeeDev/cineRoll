"use client";

import dynamic from "next/dynamic";

const LazySiteFeedbackDialog = dynamic(
  () =>
    import("@/components/site-feedback-dialog").then(
      (module) => module.SiteFeedbackDialog,
    ),
  {
    loading: () => (
      <span className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.24em] text-[#5f5f73]">
        Feedback
      </span>
    ),
    ssr: false,
  },
);

export function DeferredSiteFeedbackDialog() {
  return <LazySiteFeedbackDialog />;
}
