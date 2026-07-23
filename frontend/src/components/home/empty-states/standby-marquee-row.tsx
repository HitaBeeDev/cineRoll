import { STANDBY_LINEUP } from "@/components/home/empty-states/standby-lineup";

/** A single row of award-winner titles for the standby marquee. Two copies of
 *  this row are chained to make the loop seamless. */
export function StandbyMarqueeRow({ ariaHidden = false }: { ariaHidden?: boolean }) {
  return (
    <div
      className="flex shrink-0 items-center gap-6 pr-6 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.18em] text-[#9a9aad]"
      aria-hidden={ariaHidden || undefined}
    >
      {STANDBY_LINEUP.map((title) => (
        <span key={title} className="flex shrink-0 items-center gap-6 whitespace-nowrap">
          {title}
          <span className="text-[#D4AF37]/55">◆</span>
        </span>
      ))}
    </div>
  );
}
