import type { AwardBodyBreakdown } from "../types";
import { buildAwardBodyViewModel } from "../build-award-body-view-model";
import { BreakdownLink } from "./breakdown-link";
import { Panel } from "./panel";

export function AwardBodyPanel({ breakdown, className }: { breakdown: AwardBodyBreakdown; className?: string }) {
  const { composition, coverage } = buildAwardBodyViewModel(breakdown);

  return (
    <Panel className={className}>
      <h3 className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.18em] text-[#c4c1d2]">Distribution by award-body overlap</h3>
      <p className="mt-1 text-sm text-[#9e9ab0]">Every film in one bucket — its sole body, or “multiple” if more than one honored it.</p>
      <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-white/[0.055]">{composition.map((segment) => <div key={segment.label} className="h-full" style={{ width: `${segment.percent}%`, backgroundColor: segment.color }} />)}</div>
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">{composition.map((segment) => <li key={segment.label} className="flex items-center gap-2 font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.1em] text-[#b6b2c6]"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: segment.color }} />{segment.label}<span className="text-[#9e9ab0]">{segment.percent.toFixed(1)}%</span></li>)}</ul>
      <div className="mt-7 border-t border-white/10 pt-6">
        <h3 className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.18em] text-[#c4c1d2]">Coverage by individual award body</h3>
        <p className="mt-1 text-sm text-[#9e9ab0]">A film counts under every body that honored it, so these shares overlap.</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{coverage.map((item) => <BreakdownLink key={item.label} {...item} />)}</div>
      </div>
    </Panel>
  );
}
