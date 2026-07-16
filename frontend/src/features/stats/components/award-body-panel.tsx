import type { AwardBodyBreakdown } from "../types";
import { BreakdownLink } from "./breakdown-link";
import { Panel } from "./panel";

const BODY_LINKS = [
  { key: "oscar", label: "Oscars", color: "#e8453c", href: "/browse?awardBody=oscar" },
  { key: "goldenGlobe", label: "Golden Globe", color: "#D4AF37", href: "/browse?awardBody=goldenglobe" },
  { key: "cannes", label: "Cannes", color: "#4a9eff", href: "/browse?awardBody=cannes" },
  { key: "berlin", label: "Berlinale", color: "#a78bfa", href: "/browse?awardBody=berlin" },
] as const;

export function AwardBodyPanel({ breakdown, className }: { breakdown: AwardBodyBreakdown; className?: string }) {
  const total = breakdown.total || 1;
  const percent = (count: number) => (count / total) * 100;
  const composition = buildComposition(breakdown);
  const coverage = BODY_LINKS.filter(({ key }) => breakdown.coverage[key] > 0);

  return (
    <Panel className={className}>
      <h3 className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.18em] text-[#c4c1d2]">Distribution by award-body overlap</h3>
      <p className="mt-1 text-sm text-[#9e9ab0]">Every film in one bucket — its sole body, or “multiple” if more than one honored it.</p>
      <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-white/[0.055]">{composition.map((segment) => <div key={segment.label} className="h-full" style={{ width: `${percent(segment.count)}%`, backgroundColor: segment.color }} />)}</div>
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">{composition.map((segment) => <li key={segment.label} className="flex items-center gap-2 font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.1em] text-[#b6b2c6]"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: segment.color }} />{segment.label}<span className="text-[#9e9ab0]">{percent(segment.count).toFixed(1)}%</span></li>)}</ul>
      <div className="mt-7 border-t border-white/10 pt-6">
        <h3 className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.18em] text-[#c4c1d2]">Coverage by individual award body</h3>
        <p className="mt-1 text-sm text-[#9e9ab0]">A film counts under every body that honored it, so these shares overlap.</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{coverage.map((item) => <BreakdownLink key={item.label} {...item} count={breakdown.coverage[item.key]} percent={percent(breakdown.coverage[item.key])} />)}</div>
      </div>
    </Panel>
  );
}

function buildComposition(breakdown: AwardBodyBreakdown) {
  return [
    { label: "Oscar only", count: breakdown.composition.oscarOnly, color: "#e8453c" },
    { label: "Golden Globe only", count: breakdown.composition.goldenGlobeOnly, color: "#D4AF37" },
    { label: "Cannes only", count: breakdown.composition.cannesOnly, color: "#4a9eff" },
    { label: "Berlinale only", count: breakdown.composition.berlinOnly, color: "#a78bfa" },
    { label: "Multiple bodies", count: breakdown.composition.multiple, color: "#8a8597" },
  ].filter(({ count }) => count > 0);
}
