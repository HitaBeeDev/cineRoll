"use client";

import { useReducedMotion } from "framer-motion";
import type { CompletionistTrackerProps } from "../completionist-component-types";
import { CompletionCategoryList } from "./completion-category-list";
import { CompletionProgressBar } from "./completion-progress-bar";
import { CompletionistSummary } from "./completionist-summary";

export function CompletionistTracker({
  progress,
}: CompletionistTrackerProps) {
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <section className="mt-16" aria-labelledby="completionist-heading">
      <CompletionistSummary overall={progress.overall} />
      <CompletionProgressBar
        percentage={progress.overall.percentage}
        reduceMotion={reduceMotion}
        className="mt-5 h-2"
      />
      <CompletionCategoryList
        categories={progress.categories}
        reduceMotion={reduceMotion}
      />
    </section>
  );
}
