"use client";

import { useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { cn } from "@/lib/utils";

const EXAMPLE_PROMPTS = [
  "Something sad but beautiful",
  "A film my dad would love",
  "The most obscure Cannes winner you have",
];

export default function DescribePage() {
  const [prompt, setPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  async function handleSubmit() {
    if (!prompt.trim() || isProcessing) return;
    setIsProcessing(true);
    await new Promise((resolve) => window.setTimeout(resolve, 900));
    setIsProcessing(false);
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#09090f] text-[#F5F5F0]">
      <AppHeader />

      <main className="flex flex-1 flex-col overflow-y-auto px-5 py-5 [scrollbar-width:none] sm:px-8 lg:px-10 lg:py-7 [&::-webkit-scrollbar]:w-0">
        <section className="flex min-h-full flex-col">
          <div className="mb-5 flex flex-col gap-2">
            <p className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.3em] text-[#e8453c]/70">
              ◈ Natural Language Roll ◈
            </p>
            <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold leading-none tracking-tight text-[#F5F5F0] sm:text-6xl">
              Describe It
            </h1>
          </div>

          <div className="flex flex-1 flex-col rounded-lg border border-[#1e1e2a] bg-[#0d0d16]">
            <div className="flex items-center justify-between gap-4 border-b border-[#1e1e2a] px-4 py-3 sm:px-5">
              <div className="flex min-w-0 items-center gap-2">
                <Sparkles className="h-4 w-4 shrink-0 text-[#e8453c]" aria-hidden />
                <span className="truncate font-[family-name:var(--font-geist-mono)] text-[10px] font-bold uppercase tracking-widest text-[#888899]">
                  Plain English Prompt
                </span>
              </div>
              <span className="shrink-0 font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-widest text-[#444458]">
                {prompt.length}/500
              </span>
            </div>

            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value.slice(0, 500))}
              disabled={isProcessing}
              placeholder={`${EXAMPLE_PROMPTS[0]}\n${EXAMPLE_PROMPTS[1]}\n${EXAMPLE_PROMPTS[2]}`}
              className={cn(
                "min-h-[360px] flex-1 resize-none bg-transparent px-4 py-4 outline-none sm:px-5 sm:py-5",
                "font-[family-name:var(--font-geist-sans)] text-xl leading-8 text-[#F5F5F0] sm:text-2xl sm:leading-9",
                "placeholder:text-[#3a3a4d]",
                "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#e8453c]",
              )}
              aria-label="Describe the kind of film you want"
            />

            <div className="flex flex-col gap-4 border-t border-[#1e1e2a] px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_PROMPTS.map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => setPrompt(example)}
                    disabled={isProcessing}
                    className={cn(
                      "rounded-full border border-[#2a2a3e] px-3 py-1.5 text-left",
                      "font-[family-name:var(--font-geist-mono)] text-[9px] font-bold uppercase tracking-widest text-[#888899]",
                      "transition-colors hover:border-[#e8453c]/45 hover:text-[#F5F5F0]",
                      "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#2a2a3e]",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
                    )}
                  >
                    {example}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={!prompt.trim() || isProcessing}
                className={cn(
                  "inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full px-5",
                  "bg-[#e8453c] font-[family-name:var(--font-geist-mono)] text-[10px] font-bold uppercase tracking-widest text-[#F5F5F0]",
                  "transition-colors hover:bg-[#d5342b]",
                  "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[#e8453c]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
                  "focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090f]",
                )}
              >
                {isProcessing ? (
                  <span className="motion-safe:animate-pulse">Asking the algorithm…</span>
                ) : (
                  <>
                    Roll From Description
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
