import { cn } from "@/lib/utils/cn";

/** The "REEL // …" channel tag that sits above the verdict header. */
export function ChannelPill({ title, className }: { title: string; className?: string }) {
  const label = `REEL // ${title.toUpperCase().slice(0, 11)}`;
  return (
    <div className={cn("flex items-center", className)}>
      <span className="inline-flex items-center rounded-full border border-[#2a2a3e] bg-[#11111b] px-3 py-1 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest text-[#a8a8ba]">
        {label}
      </span>
    </div>
  );
}
