"use client";

import type { RollFilm } from "@/lib/api";
import { useFilmCarousel } from "../use-film-carousel";
import { CarouselControls } from "./carousel-controls";
import { FilmCarouselViewport } from "./film-carousel-viewport";

export function FilmCarousel({ films }: { films: RollFilm[] }) {
  const carousel = useFilmCarousel(films);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <FilmCarouselViewport
        direction={carousel.direction}
        films={carousel.slots}
        onNext={() => carousel.goToPage(carousel.page + 1)}
        onPrevious={() => carousel.goToPage(carousel.page - 1)}
        onPointerCancel={carousel.handlePointerCancel}
        onPointerDown={carousel.handlePointerDown}
        onPointerMove={carousel.handlePointerMove}
        onPointerUp={carousel.handlePointerUp}
        shouldPreventNavigation={carousel.guardCardClick}
      />
      <CarouselControls
        maxPage={carousel.maxPage}
        page={carousel.page}
        onPageChange={carousel.goToPage}
      />
    </div>
  );
}
