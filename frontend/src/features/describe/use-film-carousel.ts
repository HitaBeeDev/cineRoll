"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { PointerEvent } from "react";
import type { RollFilm } from "@/lib/api";
import { CAROUSEL_VISIBLE_COUNT } from "./carousel-config";
import type { FilmCarouselController } from "./film-carousel-controller";

const DRAG_DETECTION_DISTANCE = 8;
const PAGE_CHANGE_DISTANCE = 48;

export function useFilmCarousel(films: RollFilm[]): FilmCarouselController {
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState(1);
  const dragStartX = useRef(0);
  const isDragging = useRef(false);
  const pointerMoved = useRef(false);
  const maxPage = Math.max(
    0,
    Math.ceil(films.length / CAROUSEL_VISIBLE_COUNT) - 1,
  );

  const goToPage = useCallback((nextPage: number) => {
    const clampedPage = Math.min(Math.max(nextPage, 0), maxPage);
    if (clampedPage === page) return;
    setDirection(clampedPage > page ? 1 : -1);
    setPage(clampedPage);
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
    const start = page * CAROUSEL_VISIBLE_COUNT;
    return films.slice(start, start + CAROUSEL_VISIBLE_COUNT);
  }, [films, page]);

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
  };
}
