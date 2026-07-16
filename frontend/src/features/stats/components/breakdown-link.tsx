import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { formatNumber } from "../format-number";

type BreakdownLinkProps = { label: string; count: number; color: string; href: string; percent: number };

export function BreakdownLink({ label, count, color, href, percent }: BreakdownLinkProps) {
  return (
    <Link href={href} className="group rounded-md border border-white/10 bg-[#0d0d15] p-4 transition-colors hover:border-white/20 hover:bg-[#12121c]">
      <div className="flex items-center justify-between gap-3"><span className="flex items-center gap-2 font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.16em] text-[#a9a5bc]"><span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />{label}</span><ArrowUpRight className="h-3.5 w-3.5 text-[#777287] transition-colors group-hover:text-white" /></div>
      <p className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold leading-none text-[#f4f0f7]">{formatNumber(count)}</p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]"><div className="h-full rounded-full" style={{ width: `${Math.max(2, Math.min(100, percent))}%`, backgroundColor: color }} /></div>
      <p className="mt-2 font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.14em] text-[#9e9ab0]">{percent.toFixed(1)}% of catalog</p>
    </Link>
  );
}
