import { ChevronDown } from "lucide-react";
import { EditorialSectionLabel } from "@/components/editorial-section-label";
import type { AwardSummaryProps } from "../component-props";
import { AwardSummaryCard } from "./award-summary-card";
import { AwardsDominance } from "./awards-dominance";

export function FilmAwardsSection({ summary }: AwardSummaryProps) {
  if (summary.totalNominations === 0) return null;

  return (
    <section id="awards" className="scroll-mt-24">
      <EditorialSectionLabel>Awards &amp; Recognition</EditorialSectionLabel>
      <AwardsDominance summary={summary} />
      <details className="group mt-6">
        <summary className="flex w-fit cursor-pointer list-none items-center gap-2 font-[family-name:var(--font-geist-mono)] text-[11px] font-semibold uppercase tracking-[0.3em] text-[#9090b0] transition-colors hover:text-[#e8e8f0] [&::-webkit-details-marker]:hidden">
          Full award breakdown
          <ChevronDown
            className="h-3.5 w-3.5 transition-transform group-open:rotate-180"
            aria-hidden
          />
        </summary>
        <div className="mt-6 space-y-4">
          {summary.ceremonies.map((ceremony) => (
            <AwardSummaryCard
              key={ceremony.title}
              title={ceremony.title}
              wins={ceremony.wins}
              nominations={ceremony.nominations}
              records={ceremony.records}
              showCounts={summary.ceremonies.length > 1}
            />
          ))}
        </div>
      </details>
    </section>
  );
}
