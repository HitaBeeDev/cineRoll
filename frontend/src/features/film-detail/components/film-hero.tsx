import { getHeroImage } from "../hero-image";
import type { FilmHeroProps } from "../component-props";
import { FilmHeroAside } from "./film-hero-aside";
import { FilmHeroBackground } from "./film-hero-background";
import { FilmHeroInfo } from "./film-hero-info";
import { HeroScrollCue } from "./hero-scroll-cue";

export function FilmHero(props: FilmHeroProps) {
  const heroImage = getHeroImage(props.film);

  return (
    <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-[#07070b]">
      <FilmHeroBackground
        film={props.film}
        accent={props.accent}
        image={heroImage}
      />
      <div className="relative z-10 flex min-h-[calc(100vh-4rem)] flex-col justify-center">
        <div className="px-6 py-12 sm:px-10 sm:py-14 lg:px-16 lg:py-16">
          <div className="flex items-center justify-between gap-8 lg:gap-16">
            <FilmHeroInfo
              film={props.film}
              accent={props.accent}
              awardSummary={props.awardSummary}
            />
            <FilmHeroAside
              film={props.film}
              accent={props.accent}
              awardSummary={props.awardSummary}
              headlineAccolade={props.headlineAccolade}
            />
          </div>
        </div>
      </div>
      <HeroScrollCue />
    </section>
  );
}
