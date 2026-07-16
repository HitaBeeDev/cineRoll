import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { createPersonSlug } from "../create-person-slug";
import type { Accent, PersonStat } from "../types";
import { Panel } from "./panel";

type PersonRecordGroupProps = { heading: string; icon: ReactNode; people: PersonStat[]; unit: string; accent: Accent };

export function PersonRecordGroup({ heading, icon, people, unit, accent }: PersonRecordGroupProps) {
  const accentColor = accent === "red" ? "#ff766d" : "#78b7ff";
  const maximum = Math.max(...people.map(({ count }) => count), 1);
  return (
    <Panel className="min-w-0 overflow-hidden">
      <div className="mb-5 flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/[0.045]" style={{ color: accentColor }}>{icon}</span><h3 className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.2em] text-[#c4c1d2]">{heading}</h3></div>
      <ol className="space-y-4">
        {people.map((person, index) => {
          const first = index === 0;
          return <li key={person.name}><Link href={`/person/${createPersonSlug(person.name)}`} className="group block"><div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"><span className="flex min-w-0 items-baseline gap-2 sm:gap-3"><span className={cn("font-[family-name:var(--font-display)] font-bold tabular-nums text-[#4b4658]", first ? "text-lg sm:text-xl" : "text-base")}>{String(index + 1).padStart(2, "0")}</span><span className={cn("truncate font-[family-name:var(--font-display)] font-bold text-[#f4f0f7] transition-colors group-hover:text-white", first ? "text-xl sm:text-3xl" : "text-lg")}>{person.name}</span></span><span className="shrink-0 pl-8 leading-none sm:pl-0 sm:text-right"><span className={cn("font-[family-name:var(--font-display)] font-bold", first ? "text-2xl sm:text-4xl" : "text-xl")} style={{ color: accentColor }}>{person.count}</span><span className="ml-1.5 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.1em] text-[#9e9ab0] sm:text-xs sm:tracking-[0.14em]">{unit}</span></span></div><div className={cn("mt-2 overflow-hidden rounded-full bg-white/[0.06]", first ? "h-2" : "h-1.5")}><div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${Math.max(6, (person.count / maximum) * 100)}%`, backgroundColor: accentColor, opacity: first ? 1 : 0.55 }} /></div></Link></li>;
        })}
      </ol>
    </Panel>
  );
}
