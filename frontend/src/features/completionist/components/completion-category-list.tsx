import Link from "next/link";
import { COMPLETIONIST_BROWSE_FILTERS } from "../completionist-browse-filters";
import type { CompletionCategoryListProps } from "../completionist-component-types";
import { CompletionProgressBar } from "./completion-progress-bar";

export function CompletionCategoryList({
  categories,
  reduceMotion,
}: CompletionCategoryListProps) {
  return (
    <div className="mt-7 grid gap-x-8 gap-y-2 sm:grid-cols-2">
      {categories.map((category, index) => (
        <Link
          key={category.key}
          href={`/browse?${COMPLETIONIST_BROWSE_FILTERS[category.key]}`}
          className="group -mx-3 rounded-lg px-3 py-3 transition-colors hover:bg-[#0d0d1a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]"
          aria-label={`Browse ${category.label}: ${category.watched} of ${category.total} watched`}
        >
          <div className="flex items-baseline justify-between gap-3">
            <span className="truncate font-[family-name:var(--font-geist-mono)] text-[13px] font-semibold text-[#c8c8d2] transition-colors group-hover:text-[#F5F5F0]">
              {category.label}
            </span>
            <span className="shrink-0 font-[family-name:var(--font-geist-mono)] text-[12px] tabular-nums text-[#9a9aac]">
              {category.watched.toLocaleString()} / {category.total.toLocaleString()}
              <span className="ml-2 text-[#e8453c]" aria-hidden>→</span>
            </span>
          </div>
          <CompletionProgressBar
            percentage={category.percentage}
            reduceMotion={reduceMotion}
            delay={index * 0.06}
            className="mt-2.5 h-1.5"
          />
        </Link>
      ))}
    </div>
  );
}
