import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/cinematic/reveal";
import type { BodyCoverage } from "@/features/methodology/coverage-types";
import type { MOODS } from "@/features/moods/moods";
import { WAYS_IN } from "../constants/ways-in";
import type { DemoFilm } from "../making-of/making-of-types";

const CARD_CLASS =
  "group relative isolate flex h-[26rem] flex-col justify-end overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b12] transition-colors duration-300 hover:border-accent/50 focus-within:border-accent/60";
const STRETCHED_LINK_CLASS =
  "font-[family-name:var(--font-display)] text-3xl font-bold text-fg-hi transition-colors group-hover:text-accent-soft focus-visible:outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-2 focus-visible:after:ring-accent/60";
const IMAGE_MOTION =
  "transition-transform duration-500 ease-out group-hover:scale-[1.04] group-focus-within:scale-[1.04]";
const SCRIM =
  "pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_top,#0b0b12_22%,rgba(11,11,18,0.75)_45%,rgba(11,11,18,0.05)_75%)]";
type Mood = (typeof MOODS)[number];

/**
 * Three invitations into the catalogue, each led by real posters: a mosaic for
 * Discover, a fan of winners over a mini year ruler for Explore awards, and a
 * poster strip under real mood links for Find your mood. The remaining entry
 * points follow as a compact row, so every link /about carried is still here.
 */
export function CataloguePreviews({
  pool,
  coverage,
  moods,
}: {
  pool: DemoFilm[];
  coverage: BodyCoverage[];
  /** Only moods that have a page (enough films), so no chip leads to a 404. */
  moods: readonly Mood[];
}) {
  const mosaic = pool.slice(0, 6);
  const fan = pool.slice(6, 10);
  const strip = pool.slice(10, 13);
  const first = coverage.length ? Math.min(...coverage.map((body) => body.firstYear)) : null;
  const last = coverage.length ? Math.max(...coverage.map((body) => body.lastYear)) : null;
  const moreWays = WAYS_IN.filter((way) => way.href !== "/browse");

  return (
    <>
      <ul className="grid gap-5 md:grid-cols-3">
        <li>
          <Reveal className="h-full">
            <div className={CARD_CLASS}>
              <div aria-hidden className={`absolute inset-0 -z-20 grid grid-cols-3 grid-rows-2 gap-1 ${IMAGE_MOTION}`}>
                {mosaic.map((film) => (
                  <div key={film.slug} className="relative">
                    <Image src={film.posterUrl} alt="" fill sizes="140px" className="object-cover" />
                  </div>
                ))}
              </div>
              <span aria-hidden className={SCRIM} />
              <div className="p-6">
                <Link href="/browse" className={STRETCHED_LINK_CLASS}>
                  Discover
                </Link>
                <p className="mt-2 text-sm leading-6 text-fg-dim">
                  Browse and filter by award, year, genre, country or language.
                </p>
              </div>
            </div>
          </Reveal>
        </li>

        <li>
          <Reveal delay={0.08} className="h-full">
            <div className={CARD_CLASS}>
              <div aria-hidden className="absolute inset-x-0 top-6 -z-20 flex justify-center">
                {fan.map((film, index) => (
                  <div
                    key={film.slug}
                    className="relative -mx-4 aspect-[2/3] w-28 overflow-hidden rounded-md shadow-[0_16px_40px_rgba(0,0,0,0.6)] ring-1 ring-white/10 transition-transform duration-500 ease-out group-hover:-translate-y-2 group-focus-within:-translate-y-2"
                    style={{ rotate: `${(index - (fan.length - 1) / 2) * 6}deg`, marginTop: index % 2 ? 14 : 0 }}
                  >
                    <Image src={film.posterUrl} alt="" fill sizes="112px" className="object-cover" />
                  </div>
                ))}
              </div>
              <span aria-hidden className={SCRIM} />
              <div className="p-6">
                <div aria-hidden className="mb-5">
                  <div className="relative flex h-6 items-end justify-between">
                    {Array.from({ length: 40 }, (_, index) => (
                      <span key={index} className={`w-px ${index % 5 === 0 ? "h-4 bg-white/40" : "h-2 bg-white/15"}`} />
                    ))}
                    <span className="absolute bottom-0 left-[70%] top-0 w-0.5 -translate-x-1/2 bg-accent transition-[left] duration-700 ease-out group-hover:left-[25%]" />
                  </div>
                  {first && last && (
                    <div className="mt-1.5 flex justify-between font-[family-name:var(--font-geist-mono)] text-[11px] tabular-nums text-fg-muted">
                      <span>{first}</span>
                      <span>{last}</span>
                    </div>
                  )}
                </div>
                <Link href="/awards" className={STRETCHED_LINK_CLASS}>
                  Explore awards
                </Link>
                <p className="mt-2 text-sm leading-6 text-fg-dim">
                  Every recorded ceremony at the four awards, and what won in any year.
                </p>
              </div>
            </div>
          </Reveal>
        </li>

        <li>
          <Reveal delay={0.16} className="h-full">
            <div className={CARD_CLASS}>
              <div aria-hidden className={`absolute inset-0 -z-20 grid grid-cols-3 ${IMAGE_MOTION}`}>
                {strip.map((film) => (
                  <div key={film.slug} className="relative">
                    <Image src={film.posterUrl} alt="" fill sizes="140px" className="object-cover opacity-60" />
                  </div>
                ))}
              </div>
              <span aria-hidden className={SCRIM} />
              <div className="p-6">
                <ul className="mb-5 flex flex-wrap gap-2">
                  {moods.slice(0, 6).map((mood) => (
                    <li key={mood.tag}>
                      <Link
                        href={`/moods/${mood.tag}`}
                        className="relative z-10 block rounded-full border border-white/20 bg-black/40 px-3 py-1.5 text-sm text-fg-hi backdrop-blur-sm transition-colors hover:border-accent hover:bg-accent/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                      >
                        {mood.name}
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/moods"
                  className="font-[family-name:var(--font-display)] text-3xl font-bold text-fg-hi transition-colors hover:text-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                >
                  Find your mood
                </Link>
                <p className="mt-2 text-sm leading-6 text-fg-dim">
                  Award winners grouped by feeling, from feel-good to haunting.
                </p>
              </div>
            </div>
          </Reveal>
        </li>
      </ul>

      <nav aria-label="More ways in" className="mt-8 flex flex-wrap items-center gap-2">
        <span className="mr-2 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.16em] text-fg-faint">
          Also
        </span>
        {moreWays.map((way) => (
          <Link
            key={way.href}
            href={way.href}
            title={way.note}
            className="rounded-full border border-white/12 px-4 py-2 text-sm text-fg-dim transition-colors hover:border-accent/50 hover:text-fg-hi focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
          >
            {way.label} <span aria-hidden className="text-fg-faint">→</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
