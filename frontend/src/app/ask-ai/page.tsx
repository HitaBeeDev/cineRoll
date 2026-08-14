"use client";

import { AppHeader } from "@/components/app-header";
import { DescribeHeading } from "@/features/describe/components/describe-heading";
import { DescribeInputPanel } from "@/features/describe/components/describe-input-panel";
import { DescribeResultsPanel } from "@/features/describe/components/describe-results-panel";
import { useNaturalRoll } from "@/features/describe/use-natural-roll";

export default function DescribePage() {
  const naturalRoll = useNaturalRoll();
  // The form only needs the larger half while it is the whole task. From the
  // moment a roll is sent the answer is what the page is for, so the two panels
  // trade places — and the swap happens on submit, not on arrival, so the layout
  // moves once instead of shifting under the picks as they land.
  const showingResults = naturalRoll.isProcessing || naturalRoll.hasOutcome;

  return (
    <div className="flex min-h-screen w-full min-w-0 max-w-full flex-1 flex-col overflow-x-hidden bg-[#09090f] text-[#F5F5F0] lg:min-h-0 lg:overflow-hidden">
      <AppHeader />
      <main className="min-h-0 w-full min-w-0 max-w-full flex-1 overflow-x-hidden px-4 py-4 sm:px-8 lg:flex lg:flex-col lg:overflow-hidden lg:px-10 lg:py-5">
        <section className="grid min-h-0 w-full min-w-0 max-w-full gap-4 lg:flex-1 lg:grid-rows-[auto_minmax(0,1fr)]">
          <DescribeHeading />
          <div className="grid min-h-0 w-full min-w-0 max-w-full gap-5 lg:grid-cols-12">
            <DescribeInputPanel
              hasOutcome={naturalRoll.hasOutcome}
              isProcessing={naturalRoll.isProcessing}
              onPromptChange={naturalRoll.setPrompt}
              onReset={naturalRoll.reset}
              onSubmit={() => void naturalRoll.submit()}
              prompt={naturalRoll.prompt}
              showingResults={showingResults}
              textareaRef={naturalRoll.textareaRef}
            />
            <DescribeResultsPanel
              error={naturalRoll.error}
              interpreted={naturalRoll.interpreted}
              isProcessing={naturalRoll.isProcessing}
              noMatchFilters={naturalRoll.noMatchFilters}
              result={naturalRoll.result}
              showingResults={showingResults}
              statusMessage={naturalRoll.statusMessage}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
