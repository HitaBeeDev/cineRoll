import type { KeyboardEvent, RefObject } from "react";
import { cn } from "@/lib/utils";
import { PROMPT_MAX_LENGTH, PROMPT_PLACEHOLDER } from "../prompt-config";

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
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#1e1e2a] px-4 py-3 sm:gap-4 sm:px-5">
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
          "min-h-[180px] flex-1 resize-none bg-transparent px-4 py-4 outline-none sm:px-5 sm:py-5 lg:min-h-0",
          "font-[family-name:var(--font-geist-mono)] text-[0.8rem] leading-7 tracking-normal text-[#8d8da1] lg:text-[0.8rem] lg:leading-8",
          "placeholder:text-[#888899]",
          "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#e8453c]",
        )}
        aria-label="Describe the kind of film you want"
      />
    </>
  );
}
