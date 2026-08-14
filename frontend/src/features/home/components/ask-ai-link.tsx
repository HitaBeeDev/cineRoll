import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function AskAiLink() {
  return (
    <Link href="/ask-ai" className={cn("inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border border-edge-strong px-3 py-1.5 sm:self-end", "font-[family-name:var(--font-geist-mono)] text-[12px] font-bold uppercase tracking-widest text-fg-hi", "transition-colors hover:border-edge-hover hover:text-fg-hi", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent", "focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900")}>
      Can&apos;t decide? Ask AI<ArrowUpRight className="h-3 w-3" aria-hidden />
    </Link>
  );
}
