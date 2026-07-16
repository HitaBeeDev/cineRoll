import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
  compact?: boolean;
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  actionHref,
  actionLabel,
  compact = false,
}: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.22em] text-[#e8453c]">
          {eyebrow}
        </p>
        <h2
          className={cn(
            "mt-2 font-[family-name:var(--font-display)] font-bold tracking-tight text-[#f2eff8]",
            compact ? "text-2xl" : "text-3xl sm:text-4xl",
          )}
        >
          {title}
        </h2>
        {description && <p className="mt-2 max-w-xl text-sm text-[#9e9ab0]">{description}</p>}
      </div>
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="inline-flex w-fit items-center gap-2 rounded-md border border-white/10 bg-white/[0.045] px-3.5 py-2 font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.14em] text-[#c4c1d2] transition-colors hover:border-[#e8453c]/45 hover:text-[#ff766d]"
        >
          {actionLabel}
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}
