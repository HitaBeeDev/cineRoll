import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function AskAiLink() {
  return (
    <Link href="/ask-ai" className={cn("inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border border-[#2a2a3e] px-3 py-1.5 sm:self-end", "font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-widest text-[#F5F5F0]", "transition-colors hover:border-[#6a6a85] hover:text-[#F5F5F0]", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]", "focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090f]")}>
      Can&apos;t decide? Ask AI<ArrowUpRight className="h-3 w-3" aria-hidden />
    </Link>
  );
}
