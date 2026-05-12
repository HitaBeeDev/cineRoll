"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FilmCard } from "@/components/film-card";
import type { Film } from "@cineroll/types";

export function SimilarFilmsSlider({ films }: { films: Film[] }) {
  const ref = useRef<HTMLDivElement>(null);

  const scroll = (dir: -1 | 1) => {
    ref.current?.scrollBy({ left: dir * 260, behavior: "smooth" });
  };

  return (
    <div className="group relative -mx-2">
      {/* Prev fade + button */}
      <button
        onClick={() => scroll(-1)}
        aria-label="Scroll left"
        className="absolute bottom-0 left-0 top-0 z-10 flex w-12 items-center justify-center bg-gradient-to-r from-[#07070b] via-[#07070b]/70 to-transparent text-[#444458] opacity-0 transition-all duration-200 hover:text-[#F5F5F0] group-hover:opacity-100"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {/* Scrollable track */}
      <div
        ref={ref}
        className="flex gap-3 overflow-x-auto px-2 pb-3 [scroll-snap-type:x_mandatory] [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none" }}
      >
        {films.map((f) => (
          <div
            key={f.id}
            className="w-44 flex-shrink-0 [scroll-snap-align:start] sm:w-52"
          >
            <FilmCard film={f} />
          </div>
        ))}
      </div>

      {/* Next fade + button */}
      <button
        onClick={() => scroll(1)}
        aria-label="Scroll right"
        className="absolute bottom-0 right-0 top-0 z-10 flex w-12 items-center justify-center bg-gradient-to-l from-[#07070b] via-[#07070b]/70 to-transparent text-[#444458] opacity-0 transition-all duration-200 hover:text-[#F5F5F0] group-hover:opacity-100"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
