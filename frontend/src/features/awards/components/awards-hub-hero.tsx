import { Breadcrumbs } from "@/components/breadcrumbs/breadcrumbs";
import { FilmTexture } from "@/components/cinematic/film-texture";
import { LastUpdated } from "@/components/last-updated";
import type { HubImage } from "../hub/hub-types";
import { HeroPosterStack } from "./hero-poster-stack";

/**
 * The awards hub hero: heading and a two-sentence intro beside a fan of real
 * top-prize winners' posters. Kept short so the award cards start high.
 */
export function AwardsHubHero({
  updatedAt,
  posters,
}: {
  updatedAt: string | null;
  posters: HubImage[];
}) {
  return (
    <section className="relative isolate overflow-hidden border-b border-white/10 bg-[#07070b]">
      <FilmTexture />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-10 px-6 pb-10 pt-12 lg:grid-cols-[1.15fr_1fr] lg:px-10 lg:pt-14">
        <div>
          <Breadcrumbs crumbs={[{ label: "Awards", href: "/awards" }]} />
          <h1 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.05] tracking-tight text-fg-hi sm:text-5xl xl:text-6xl">
            Film Awards: <span className="italic text-accent-soft">Winners</span> and Nominees
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-fg-muted">
            Every film in CineRoll was nominated at one of these four awards. Pick one to browse its
            ceremonies and categories as recorded here — winners are listed first, so each ceremony
            answers &ldquo;who won that year?&rdquo;.
          </p>
          <LastUpdated iso={updatedAt} className="mt-6" />
        </div>
        <HeroPosterStack posters={posters} />
      </div>
    </section>
  );
}
