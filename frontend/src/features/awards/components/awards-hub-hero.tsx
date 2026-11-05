import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs/breadcrumbs";
import { FilmTexture } from "@/components/cinematic/film-texture";
import { LastUpdated } from "@/components/last-updated";
import { AWARD_BODIES } from "../award-bodies";
import { CeremonyTimeline } from "./ceremony-timeline";
import { PremiereSearchlights } from "./premiere-searchlights";

/**
 * The awards hub hero. Its motif is the ceremony itself: gold premiere
 * searchlights behind the title and a timeline sweeping every year on record.
 */
export function AwardsHubHero({
  updatedAt,
  span,
}: {
  updatedAt: string | null;
  /** First and latest ceremony year across the four bodies; null hides the timeline. */
  span: { firstYear: number; lastYear: number } | null;
}) {
  return (
    <section className="relative isolate overflow-hidden border-b border-white/10 bg-[#07070b]">
      <PremiereSearchlights />
      <FilmTexture />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-6 pb-14 pt-20 lg:px-10 lg:pt-24">
        <Breadcrumbs crumbs={[{ label: "Awards", href: "/awards" }]} />
        <h1 className="mt-6 max-w-4xl font-[family-name:var(--font-display)] text-5xl font-bold leading-[1.04] tracking-tight text-fg-hi sm:text-7xl">
          Film Awards: <span className="italic text-accent-soft">Winners</span> and Nominees
        </h1>
        <p className="mt-7 max-w-2xl text-lg leading-8 text-fg-muted">
          Every film in CineRoll was nominated at one of these four. Each award has its own page
          with every ceremony on record, from the first one to this year&apos;s, and every
          category — from Best Picture and the Palme d&apos;Or down to the craft and short-film
          prizes. Winners are always listed first, so a ceremony page doubles as a quick answer to
          &ldquo;who won that year?&rdquo;.
        </p>

        <nav aria-label="Jump to an award" className="mt-9 flex flex-wrap gap-2">
          {AWARD_BODIES.map((body) => (
            <Link
              key={body.slug}
              href={`/awards/${body.slug}`}
              className="rounded-full border border-white/15 bg-white/[0.03] px-4 py-2 text-sm text-fg-dim backdrop-blur-sm transition-colors hover:border-accent/60 hover:text-fg-hi focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
            >
              {body.shortName}
            </Link>
          ))}
        </nav>

        {span && (
          <div className="mt-14">
            <p className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.2em] text-fg-faint">
              Every ceremony on record · {span.firstYear}–{span.lastYear}
            </p>
            <CeremonyTimeline firstYear={span.firstYear} lastYear={span.lastYear} />
          </div>
        )}
        <LastUpdated iso={updatedAt} className="mt-8" />
      </div>
    </section>
  );
}
