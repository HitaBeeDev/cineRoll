import { Breadcrumbs } from "@/components/breadcrumbs/breadcrumbs";
import { FilmTexture } from "@/components/cinematic/film-texture";
import { LastUpdated } from "@/components/last-updated";
import { CeremonyTimeline } from "./ceremony-timeline";
import { PremiereSearchlights } from "./premiere-searchlights";

/**
 * The awards hub hero, kept short so the award cards start high on a laptop
 * screen. Its motif is the ceremony itself: gold premiere searchlights behind
 * the title and a decorative sweep across the years on record.
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

      <div className="relative z-10 mx-auto w-full max-w-5xl px-6 pb-10 pt-12 lg:px-10 lg:pt-14">
        <Breadcrumbs crumbs={[{ label: "Awards", href: "/awards" }]} />
        <h1 className="mt-5 max-w-4xl font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.05] tracking-tight text-fg-hi sm:text-6xl">
          Film Awards: <span className="italic text-accent-soft">Winners</span> and Nominees
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-fg-muted">
          Every film in CineRoll was nominated at one of these four awards. Pick one to browse its
          ceremonies and categories as recorded here — winners are listed first, so each ceremony
          answers &ldquo;who won that year?&rdquo;.
        </p>

        {span && (
          <div className="mt-8">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
              <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.16em] text-fg-muted">
                Award records spanning {span.firstYear}–{span.lastYear}
              </p>
              <LastUpdated iso={updatedAt} />
            </div>
            <CeremonyTimeline firstYear={span.firstYear} lastYear={span.lastYear} />
          </div>
        )}
        {!span && <LastUpdated iso={updatedAt} className="mt-8" />}
      </div>
    </section>
  );
}
