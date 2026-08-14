"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { PointerEvent } from "react";
import type { RollFilm } from "@/lib/api";
import { useCarouselVisibleCount } from "@/features/describe/carousel-config/use-carousel-visible-count";
import type { FilmCarouselController } from "./film-carousel-controller";

const DRAG_DETECTION_DISTANCE = 8;
const PAGE_CHANGE_DISTANCE = 48;

export function useFilmCarousel(films: RollFilm[]): FilmCarouselController {
  const visibleCount = useCarouselVisibleCount();
  const [requestedPage, setRequestedPage] = useState(0);
  const [direction, setDirection] = useState(1);
  const dragStartX = useRef(0);
  const isDragging = useRef(false);
  const pointerMoved = useRef(false);
  const maxPage = Math.max(0, Math.ceil(films.length / visibleCount) - 1);
  // Widening the window fits more cards per page and so drops the page count:
  // the page being read has to fall back into range rather than slice past the
  // end of the list and leave the viewport blank.
  const page = Math.min(requestedPage, maxPage);

  const goToPage = useCallback((nextPage: number) => {
    const clampedPage = Math.min(Math.max(nextPage, 0), maxPage);
    if (clampedPage === page) return;
    setDirection(clampedPage > page ? 1 : -1);
    setRequestedPage(clampedPage);
  }, [maxPage, page]);

  const handlePointerDown = useCallback((event: PointerEvent<HTMLDivElement>) => {
    isDragging.current = true;
    pointerMoved.current = false;
    dragStartX.current = event.clientX;
  }, []);

  const handlePointerMove = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    if (Math.abs(event.clientX - dragStartX.current) > DRAG_DETECTION_DISTANCE) {
      pointerMoved.current = true;
    }
  }, []);

  const handlePointerUp = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (!isDragging.current) return;
      isDragging.current = false;
      const distance = event.clientX - dragStartX.current;
      if (distance <= -PAGE_CHANGE_DISTANCE) goToPage(page + 1);
      if (distance >= PAGE_CHANGE_DISTANCE) goToPage(page - 1);
    },
    [goToPage, page],
  );

  const handlePointerCancel = useCallback(() => {
    isDragging.current = false;
  }, []);

  const slots = useMemo(() => {
    const start = page * visibleCount;
    return films.slice(start, start + visibleCount);
  }, [films, page, visibleCount]);

  return {
    direction,
    goToPage,
    guardCardClick: () => pointerMoved.current,
    handlePointerCancel,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    maxPage,
    page,
    slots,
    visibleCount,
  };
}
