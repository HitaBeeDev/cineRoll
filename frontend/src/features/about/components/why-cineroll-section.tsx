import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Reveal } from "@/components/cinematic/reveal";
import type { Spotlight } from "../making-of/making-of-types";
import { SpotlightTabs } from "./spotlight-tabs";

/**
 * Reel 02 as a full-width band: the spotlight film's poster large on the left,
 * its own artwork washed faintly across the band, and the heading, lede and
 * award tabs on the right. The one section that breaks the page width.
 */
export function WhyCineRollSection({ spotlight, lede }: { spotlight: Spotlight | null; lede: ReactNode }) {
  return (
    <section className="relative isolate overflow-hidden bg-[#0a0a10]">
      {spotlight?.posterUrl && (
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <Image src={spotlight.posterUrl} alt="" fill sizes="100vw" className="scale-110 object-cover opacity-20 blur-2xl" />
          <span className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,10,16,0.4),#0a0a10_70%)]" />
        </div>
      )}

      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[20rem_1fr] lg:gap-16 lg:px-10 lg:py-24">
        {spotlight && (
          <Reveal className="self-center">
            <Link href={`/film/${spotlight.slug}`} className="group block focus-visible:outline-none">
              <span className="relative block aspect-[2/3] w-56 overflow-hidden rounded-xl shadow-[0_40px_90px_rgba(0,0,0,0.7)] ring-1 ring-white/10 group-focus-visible:ring-2 group-focus-visible:ring-accent sm:w-64 lg:w-full">
                {spotlight.posterUrl && (
                  <Image
                    src={spotlight.posterUrl}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 320px, 256px"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105 group-focus-visible:scale-105"
                  />
                )}
              </span>
              <span className="mt-4 block font-[family-name:var(--font-display)] text-2xl font-bold text-fg-hi transition-colors group-hover:text-accent-soft">
                {spotlight.title}
              </span>
              <span className="mt-1 block text-sm text-fg-faint">{spotlight.year}</span>
            </Link>
          </Reveal>
        )}

        <div className={spotlight ? "" : "lg:col-span-2"}>
          <Reveal>
            <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.2em] text-accent">
              Reel 02
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold leading-tight tracking-tight text-fg-hi sm:text-5xl">
              Why CineRoll?
            </h2>
            <div className="mt-5 max-w-2xl text-base leading-7 text-fg-dim sm:text-[17px] sm:leading-8">{lede}</div>
          </Reveal>
          {spotlight && (
            <div className="mt-8">
              <SpotlightTabs spotlight={spotlight} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
