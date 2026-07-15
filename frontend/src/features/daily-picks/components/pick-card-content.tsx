import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { PickCardContentProps } from "../component-props";
import { getPickRationale } from "../pick-rationale";
import { PickActions } from "./pick-actions";
import { PickMetadata } from "./pick-metadata";
import { PickSlotKicker } from "./pick-slot-kicker";

export function PickCardContent({ pick }: PickCardContentProps) {
  const { film, slot } = pick;

  return (
    <div className="relative z-10 mx-auto w-full max-w-screen-xl px-6 pb-20 pt-24 sm:px-10 sm:pb-28">
      <div className="max-w-2xl">
        <PickSlotKicker slot={slot} />
        <h2
          className="font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.04] text-[#F5F5F0] sm:text-6xl"
          style={{ textShadow: "0 2px 20px rgba(0,0,0,0.6)" }}
        >
          {film.title}
        </h2>
        <PickMetadata film={film} />
        {film.director && (
          <p className="mt-2 font-[family-name:var(--font-geist-mono)] text-[12px] uppercase tracking-wider text-[#8a8a9e]">
            Dir. {film.director}
          </p>
        )}
        <p className="mt-5 line-clamp-2 max-w-xl font-[family-name:var(--font-display)] text-lg leading-relaxed text-[#cfcfdc] sm:text-xl">
          {getPickRationale(film, slot)}
        </p>
        <div className="mt-7 flex items-center gap-2.5">
          <Link
            href={`/film/${film.slug}`}
            className="group/btn inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/[0.04] px-6 py-3 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.2em] text-[#F5F5F0] backdrop-blur-sm transition-colors duration-150 hover:border-white/50 hover:bg-white/[0.1]"
          >
            <span>Watch Tonight</span>
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
          </Link>
          <PickActions film={film} />
        </div>
      </div>
    </div>
  );
}
