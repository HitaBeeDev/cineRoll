import type { KeyboardEvent, RefObject } from "react";
import { cn } from "@/lib/utils/cn";
import { PROMPT_MAX_LENGTH } from "@/features/describe/prompt-config/prompt-max-length";
import { PROMPT_PLACEHOLDER } from "@/features/describe/prompt-config/prompt-placeholder";

type PromptTextareaProps = {
  disabled: boolean;
  onChange: (prompt: string) => void;
  onSubmit: () => void;
  prompt: string;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
};

export function PromptTextarea({
  disabled,
  onChange,
  onSubmit,
  prompt,
  textareaRef,
}: PromptTextareaProps) {
  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      onSubmit();
    }
  }

  return (
    <>
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-edge px-4 py-3 sm:gap-4 sm:px-5">
        <span className="min-w-0 truncate font-[family-name:var(--font-geist-mono)] text-[10px] font-bold uppercase tracking-[0.14em] text-[#888899] sm:text-[11px] sm:tracking-widest">
          Describe the mood, era, awards, or people
        </span>
        <span className="shrink-0 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest text-[#888899]">
          {prompt.length}/{PROMPT_MAX_LENGTH}
        </span>
      </div>
      <textarea
        ref={textareaRef}
        value={prompt}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        maxLength={PROMPT_MAX_LENGTH}
        placeholder={PROMPT_PLACEHOLDER}
        className={cn(
          // The lg floor is the two-line placeholder plus its padding: below
          // that the pane would start clipping the hint again on a very short
          // window, and it is low enough that no normal viewport is pushed.
          "min-h-[180px] flex-1 resize-none bg-transparent px-4 py-4 outline-none sm:px-5 sm:py-5 lg:min-h-[6.5rem]",
          "font-[family-name:var(--font-geist-mono)] text-[0.8rem] leading-7 tracking-normal text-[#8d8da1] lg:text-[0.8rem] lg:leading-8",
          "placeholder:text-[#888899]",
          "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent",
        )}
        aria-label="Describe the kind of film you want"
      />
    </>
  );
}
