"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Clock, Globe } from "lucide-react";

const FALLBACK_ACCENT = "#D4AF37";
const grainBackgroundImage = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")";

function hexToRgba(hex: string, alpha: number): string {
  const normalized = /^#[0-9A-Fa-f]{6}$/.test(hex) ? hex : FALLBACK_ACCENT;
  const r = parseInt(normalized.slice(1, 3), 16);
  const g = parseInt(normalized.slice(3, 5), 16);
  const b = parseInt(normalized.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

type FilmDetailHeroProps = {
  title: string;
  year: number;
  runtime: number | null;
  language: string | null;
  director: string | null;
  backdropUrl: string | null;
  posterColor: string | null;
  isPickOfDay: boolean;
};

export function FilmDetailHero({
  title,
  year,
  runtime,
  language,
  director,
  backdropUrl,
  posterColor,
  isPickOfDay,
}: FilmDetailHeroProps) {
  const heroRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const backdropY = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [0, 0] : [0, 120]);
  const filmAccent = posterColor ?? FALLBACK_ACCENT;

  return (
    <section ref={heroRef} className="relative flex min-h-[68vh] overflow-hidden bg-[#09090f]">
      {backdropUrl && (
        <motion.div
          className="absolute inset-x-0 -top-[18%] -bottom-[18%]"
          style={{ y: backdropY }}
          aria-hidden
        >
          <Image
            src={backdropUrl}
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-center brightness-[0.42] saturate-125"
            priority
          />
        </motion.div>
      )}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 150% 95% at 50% 0%, ${hexToRgba(filmAccent, 0.68)} 0%, ${hexToRgba(filmAccent, 0.32)} 38%, transparent 72%)`,
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(to_top,#09090f_0%,#09090f_18%,rgba(9,9,15,0.7)_48%,rgba(9,9,15,0.18)_100%)]" />
      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-screen"
        style={{ backgroundImage: grainBackgroundImage, backgroundSize: "160px 160px" }}
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col justify-end px-4 pb-[12vh] pt-28 sm:px-6 lg:px-8">
        <div className="max-w-4xl">
          {isPickOfDay && (
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-amber-400">
              Pick of the Day
            </p>
          )}
          <h1 className="font-[family-name:var(--font-display)] text-[clamp(2.75rem,8vw,6.5rem)] font-bold leading-[0.95] text-[#F5F5F0]">
            {title}
          </h1>
          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-[#D8D8D0]/82">
            <span>{year}</span>
            {runtime != null && (
              <>
                <span className="text-[#D8D8D0]/35" aria-hidden>·</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" aria-hidden />
                  {runtime} min
                </span>
              </>
            )}
            {language && (
              <>
                <span className="text-[#D8D8D0]/35" aria-hidden>·</span>
                <span className="flex items-center gap-1">
                  <Globe className="h-3.5 w-3.5" aria-hidden />
                  {language}
                </span>
              </>
            )}
            {director && (
              <>
                <span className="text-[#D8D8D0]/35" aria-hidden>·</span>
                <span>
                  Directed by <span className="font-medium text-[#F5F5F0]">{director}</span>
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
