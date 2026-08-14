import type { RefObject } from "react";
import { cn } from "@/lib/utils/cn";
import { ExamplePromptList } from "./example-prompt-list";
import { PromptTextarea } from "./prompt-textarea";
import { RollActions } from "./roll-actions";

type DescribeInputPanelProps = {
  hasOutcome: boolean;
  isProcessing: boolean;
  onPromptChange: (prompt: string) => void;
  onReset: () => void;
  onSubmit: () => void;
  prompt: string;
  showingResults: boolean;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
};

export function DescribeInputPanel(props: DescribeInputPanelProps) {
  return (
    <div
      className={cn(
        "flex min-h-0 w-full min-w-0 max-w-full flex-col",
        // Hands the wider half to the answer once there is one. The form keeps
        // enough width to read and edit the prompt that produced it.
        props.showingResults ? "lg:col-span-4" : "lg:col-span-7",
      )}
    >
      <div className="flex min-h-0 w-full min-w-0 max-w-full flex-1 flex-col rounded-lg border border-edge bg-[#0d0d16] shadow-[0_18px_70px_rgba(0,0,0,0.28)]">
        <PromptTextarea
          disabled={props.isProcessing}
          onChange={props.onPromptChange}
          onSubmit={props.onSubmit}
          prompt={props.prompt}
          textareaRef={props.textareaRef}
        />
        <div className="shrink-0 border-t border-edge px-4 py-4 sm:px-5">
          <ExamplePromptList
            disabled={props.isProcessing}
            onSelect={props.onPromptChange}
          />
          <RollActions
            canSubmit={Boolean(props.prompt.trim())}
            isProcessing={props.isProcessing}
            showReset={props.hasOutcome}
            onReset={props.onReset}
            onSubmit={props.onSubmit}
          />
        </div>
      </div>
    </div>
  );
}
