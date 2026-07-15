import type { PointerEventHandler } from "react";
import type { RollFilm } from "@/lib/api";

export type FilmCarouselController = {
  direction: number;
  goToPage: (page: number) => void;
  guardCardClick: () => boolean;
  handlePointerCancel: PointerEventHandler<HTMLDivElement>;
  handlePointerDown: PointerEventHandler<HTMLDivElement>;
  handlePointerMove: PointerEventHandler<HTMLDivElement>;
  handlePointerUp: PointerEventHandler<HTMLDivElement>;
  maxPage: number;
  page: number;
  slots: RollFilm[];
};
