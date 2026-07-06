import Image from "next/image";
import { Clapperboard } from "lucide-react";
import type { RollFilm } from "@/lib/api";

type PosterRevealProps = {
  film: RollFilm;
  correct: boolean | null;
};

export function PosterReveal({ film, correct }: PosterRevealProps) {
  return (
    <div className="relative min-h-0 flex-1 overflow-hidden rounded-xl border border-[#2a2a3e] bg-[#09090f] shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
      {film.posterUrl ? (
        <Image src={film.posterUrl} alt={film.title} fill sizes="380px" className="object-cover" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <Clapperboard className="h-12 w-12 text-[#2a2a3e]" />
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/78 to-transparent p-4 pt-20 text-center">
        <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.24em] text-[#D4AF37]">
          {correct ? "Case Closed" : "The Answer"}
        </p>
        <h2 className="mt-2 line-clamp-2 font-[family-name:var(--font-display)] text-3xl font-bold leading-tight">
          {film.title}
        </h2>
        <p className="mt-1 text-sm text-[#d4d4df]">{film.year}</p>
      </div>
    </div>
  );
}
