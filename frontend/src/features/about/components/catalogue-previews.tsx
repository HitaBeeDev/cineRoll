import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/cinematic/reveal";
import type { BodyCoverage } from "@/features/methodology/coverage-types";
import type { MOODS } from "@/features/moods/moods";
import { WAYS_IN } from "../constants/ways-in";
import type { DemoFilm } from "../making-of/making-of-types";

const CARD_CLASS =
  "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b12] transition-colors duration-300 hover:border-accent/40 focus-within:border-accent/50";
const STRETCHED_LINK_CLASS =
  "font-[family-name:var(--font-display)] text-2xl font-bold text-fg-hi transition-colors group-hover:text-accent-soft focus-visible:outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-2 focus-visible:after:ring-accent/60";
type Mood = (typeof MOODS)[number];

/**
 * Three ways into the catalogue, each shown rather than described: real
 * posters for Discover, a miniature of the awards year ruler, and real mood
 * links. The remaining entry points follow as a compact row, so every link
 * /about used to carry is still here.
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
  const first = coverage.length ? Math.min(...coverage.map((body) => body.firstYear)) : null;
  const last = coverage.length ? Math.max(...coverage.map((body) => body.lastYear)) : null;
  const moreWays = WAYS_IN.filter((way) => way.href !== "/browse");

  return (
    <>
      <ul className="grid gap-4 md:grid-cols-3">
        <li>
          <Reveal className="h-full">
            <div className={CARD_CLASS}>
              <div className="grid h-44 grid-cols-3 gap-1.5 overflow-hidden p-3" aria-hidden>
                {mosaic.map((film, index) => (
                  <div
                    key={film.slug}
                    className={`relative overflow-hidden rounded-md transition-transform duration-500 ease-out group-hover:-translate-y-2 group-focus-within:-translate-y-2 ${index % 2 ? "translate-y-3" : ""}`}
                  >
                    <Image src={film.posterUrl} alt="" fill sizes="120px" className="object-cover" />
                  </div>
                ))}
              </div>
              <div className="flex flex-1 flex-col p-6 pt-4">
                <Link href="/browse" className={STRETCHED_LINK_CLASS}>
                  Discover
                </Link>
                <p className="mt-2 text-sm leading-6 text-fg-muted">
                  Browse and filter by award, year, genre, country or language.
                </p>
              </div>
            </div>
          </Reveal>
        </li>

        <li>
          <Reveal delay={0.08} className="h-full">
            <div className={CARD_CLASS}>
              <div className="flex h-44 flex-col justify-end px-6 pb-5" aria-hidden>
                <div className="relative flex h-10 items-end justify-between">
                  {Array.from({ length: 40 }, (_, index) => (
                    <span
                      key={index}
                      className={`w-px origin-bottom transition-transform duration-500 ${index % 5 === 0 ? "h-6 bg-white/40" : "h-2.5 bg-white/15"} ${Math.abs(index - 26) < 3 ? "scale-y-[2.2] group-hover:scale-y-100" : ""} ${Math.abs(index - 12) < 3 ? "group-hover:scale-y-[2.2]" : ""}`}
                    />
                  ))}
                  <span className="absolute bottom-0 left-[65%] top-0 w-0.5 -translate-x-1/2 bg-accent shadow-[0_0_12px_rgba(232,69,60,0.8)] transition-[left] duration-500 ease-out group-hover:left-[30%]">
                    <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-accent" />
                  </span>
                </div>
                {first && last && (
                  <div className="mt-2 flex justify-between font-[family-name:var(--font-geist-mono)] text-[11px] tabular-nums text-fg-muted">
                    <span>{first}</span>
                    <span>{last}</span>
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-6 pt-4">
                <Link href="/awards" className={STRETCHED_LINK_CLASS}>
                  Explore awards
                </Link>
                <p className="mt-2 text-sm leading-6 text-fg-muted">
                  Every recorded ceremony at the four awards, and what won in any year.
                </p>
              </div>
            </div>
          </Reveal>
        </li>

        <li>
          <Reveal delay={0.16} className="h-full">
            <div className={CARD_CLASS}>
              <ul className="flex h-44 flex-wrap content-center gap-2 px-6">
                {moods.slice(0, 6).map((mood) => (
                  <li key={mood.tag}>
                    <Link
                      href={`/moods/${mood.tag}`}
                      className="relative z-10 block rounded-full border border-white/15 bg-white/[0.03] px-3 py-1.5 text-sm text-fg-dim transition-colors hover:border-accent/60 hover:text-fg-hi focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                    >
                      {mood.name}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="flex flex-1 flex-col p-6 pt-4">
                <Link href="/moods" className="font-[family-name:var(--font-display)] text-2xl font-bold text-fg-hi transition-colors hover:text-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60">
                  Find your mood
                </Link>
                <p className="mt-2 text-sm leading-6 text-fg-muted">
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
