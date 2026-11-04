import Link from "next/link";
import { STANDBY_LINEUP } from "@/components/home/empty-states/standby-lineup";

/** A single row of award-winner titles for the standby marquee, each a link to
 *  its film page. Two copies of this row are chained to make the loop seamless;
 *  the second is hidden from assistive tech and taken out of the tab order. */
export function StandbyMarqueeRow({ ariaHidden = false }: { ariaHidden?: boolean }) {
  return (
    <div
      className="flex shrink-0 items-center gap-6 pr-6 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.18em] text-[#9a9aad]"
      aria-hidden={ariaHidden || undefined}
    >
      {STANDBY_LINEUP.map(({ title, slug }) => (
        <span key={slug} className="flex shrink-0 items-center gap-6 whitespace-nowrap">
          <Link
            href={`/film/${slug}`}
            tabIndex={ariaHidden ? -1 : undefined}
            className="rounded-sm transition-colors hover:text-fg-hi focus-visible:text-fg-hi focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
          >
            {title}
          </Link>
          <span className="text-gold/55" aria-hidden>◆</span>
        </span>
      ))}
    </div>
  );
}
