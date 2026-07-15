import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { KeyboardEvent, PointerEventHandler } from "react";
import type { RollFilm } from "@/lib/api";
import { FADE_VARIANTS, FLIP_VARIANTS } from "../carousel-config";
import { FilmCard } from "./film-card";

type FilmCarouselViewportProps = {
  direction: number;
  films: RollFilm[];
  onNext: () => void;
  onPrevious: () => void;
  onPointerCancel: PointerEventHandler<HTMLDivElement>;
  onPointerDown: PointerEventHandler<HTMLDivElement>;
  onPointerMove: PointerEventHandler<HTMLDivElement>;
  onPointerUp: PointerEventHandler<HTMLDivElement>;
  shouldPreventNavigation: () => boolean;
};

export function FilmCarouselViewport(props: FilmCarouselViewportProps) {
  const reduceMotion = useReducedMotion();

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      props.onNext();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      props.onPrevious();
    }
  }

  return (
    <div
      role="group"
      aria-roledescription="carousel"
      aria-label="Film picks"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onPointerDown={props.onPointerDown}
      onPointerMove={props.onPointerMove}
      onPointerUp={props.onPointerUp}
      onPointerCancel={props.onPointerCancel}
      className="relative flex min-h-0 flex-1 cursor-grab touch-pan-y select-none gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]/40 active:cursor-grabbing"
      style={{ perspective: "1600px" }}
    >
      {props.films.map((film, index) => (
        <div
          key={index}
          className="relative min-h-0 flex-1"
          style={{ transformStyle: "preserve-3d" }}
        >
          <AnimatePresence initial={false} custom={props.direction} mode="popLayout">
            <motion.div
              key={film.id}
              custom={props.direction}
              variants={reduceMotion ? FADE_VARIANTS : FLIP_VARIANTS}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                duration: reduceMotion ? 0.2 : 0.45,
                ease: [0.22, 1, 0.36, 1],
                delay: reduceMotion ? 0 : index * 0.06,
              }}
              className="absolute inset-0"
              style={{ transformOrigin: "center", backfaceVisibility: "hidden" }}
            >
              <FilmCard
                film={film}
                shouldPreventNavigation={props.shouldPreventNavigation}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
