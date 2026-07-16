import type { ReactNode } from "react";

type PulseCardProps = { label: string; detail: string; context: string; value: ReactNode; visual: ReactNode };

export function PulseCard({ label, detail, context, value, visual }: PulseCardProps) {
  return (
    <div className="flex min-w-0 items-center gap-4 rounded-lg border border-white/10 bg-white/[0.035] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.18)] sm:gap-5 sm:p-5">
      <div className="shrink-0">{visual}</div>
      <div className="min-w-0">
        <p className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.18em] text-[#b6b2c6]">{label}</p>
        <p className="mt-2 font-[family-name:var(--font-display)] text-4xl font-bold leading-none text-[#f4f0f7]">{value}</p>
        <p className="mt-2 text-sm text-[#c4c1d2]">{detail}</p>
        <p className="mt-1 font-[family-name:var(--font-geist-mono)] text-xs tracking-[0.02em] text-[#ff8a83]">{context}</p>
      </div>
    </div>
  );
}
