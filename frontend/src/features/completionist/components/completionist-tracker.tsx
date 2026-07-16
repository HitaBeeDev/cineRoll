"use client";

import { useReducedMotion } from "framer-motion";
import type { CompletionistTrackerProps } from "../completionist-component-types";
import { ArchiveFilmStrip } from "./archive-film-strip";
import { ArchiveInvitation } from "./archive-invitation";
import { CompletionCategoryList } from "./completion-category-list";
import { CompletionistSummary } from "./completionist-summary";

export function CompletionistTracker({
  progress,
}: CompletionistTrackerProps) {
  const reduceMotion = useReducedMotion() ?? false;
  // Collections with no films (e.g. data not seeded yet) are noise, not progress.
  const collections = progress.categories.filter(
    (category) => category.total > 0,
  );

  return (
    <section className="mt-16" aria-labelledby="completionist-heading">
      <CompletionistSummary overall={progress.overall} />
      <ArchiveFilmStrip
        percentage={progress.overall.percentage}
        reduceMotion={reduceMotion}
      />
      {progress.overall.watched === 0 ? (
        <ArchiveInvitation categories={collections} />
      ) : (
        <CompletionCategoryList
          categories={collections}
          reduceMotion={reduceMotion}
        />
      )}
    </section>
  );
}
