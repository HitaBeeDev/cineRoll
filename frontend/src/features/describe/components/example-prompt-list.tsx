import { cn } from "@/lib/utils";
import { EXAMPLE_PROMPTS } from "../prompt-config";

type ExamplePromptListProps = {
  disabled: boolean;
  onSelect: (prompt: string) => void;
};

export function ExamplePromptList({ disabled, onSelect }: ExamplePromptListProps) {
  return (
    <div className="mb-4 flex min-w-0 flex-wrap gap-2">
      {EXAMPLE_PROMPTS.map((example) => (
        <button
          key={example}
          type="button"
          onClick={() => onSelect(example)}
          disabled={disabled}
          className={cn(
            "max-w-full whitespace-normal break-words rounded-full border border-[#2a2a3e] px-3 py-1.5 text-left",
            "font-[family-name:var(--font-geist-mono)] text-[10px] font-bold uppercase leading-4 tracking-[0.12em] text-[#888899] sm:text-[11px] sm:tracking-widest",
            "transition-colors hover:border-[#e8453c]/45 hover:text-[#F5F5F0]",
            "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#2a2a3e]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
          )}
        >
          {example}
        </button>
      ))}
    </div>
  );
}
