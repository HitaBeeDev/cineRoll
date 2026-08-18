import type {
  NaturalRollFilters,
  NaturalRollInterpreted,
  NaturalRollResult,
} from "@/lib/api";
import { cn } from "@/lib/utils/cn";
import { DescribeIntroPanel } from "./describe-intro-panel";
import { NoMatchPanel } from "./no-match-panel";
import { ProcessingPanel } from "./processing-panel";
import { ResultPanel } from "./result-panel";
import { RollErrorPanel } from "./roll-error-panel";

type DescribeResultsPanelProps = {
  error: string | null;
  interpreted: NaturalRollInterpreted | null;
  isProcessing: boolean;
  noMatchFilters: NaturalRollFilters | null;
  result: NaturalRollResult | null;
  showingResults: boolean;
  statusMessage: string;
};

export function DescribeResultsPanel(props: DescribeResultsPanelProps) {
  return (
    <div
      aria-live="polite"
      aria-busy={props.isProcessing}
      data-lenis-prevent
      className={cn(
        "min-h-[420px] min-w-0 rounded-lg border border-[#1a1a28] bg-[#0d0d16] lg:min-h-0",
        // The intro sits beside a full-width form; the answer takes the room.
        props.showingResults ? "lg:col-span-8" : "lg:col-span-5",
        props.result
          ? "lg:overflow-y-auto lg:[scrollbar-width:none] lg:[&::-webkit-scrollbar]:w-0"
          : "lg:overflow-hidden",
      )}
    >
      <p className="sr-only" role="status">{props.statusMessage}</p>
      {props.isProcessing ? (
        <ProcessingPanel interpreted={props.interpreted} />
      ) : props.error ? (
        <RollErrorPanel message={props.error} />
      ) : props.noMatchFilters ? (
        <NoMatchPanel filters={props.noMatchFilters} />
      ) : props.result ? (
        <ResultPanel interpreted={props.interpreted} result={props.result} />
      ) : (
        <DescribeIntroPanel />
      )}
    </div>
  );
}
