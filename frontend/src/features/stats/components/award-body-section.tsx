import type { AwardBodyBreakdown } from "../types";
import { AwardBodyPanel } from "./award-body-panel";
import { SectionHeader } from "./section-header";

export function AwardBodySection({ breakdown }: { breakdown: AwardBodyBreakdown | null }) {
  if (!breakdown) return null;
  return <section><SectionHeader eyebrow="Dataset mix" title="Award body landscape" compact /><AwardBodyPanel breakdown={breakdown} className="mt-5" /></section>;
}
