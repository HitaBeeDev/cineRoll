import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/cinematic/reveal";
import type { BodyCoverage } from "@/features/methodology/coverage-types";
import type { AWARD_BODIES } from "../award-bodies";
import type { HubImage } from "../hub/hub-types";

type AwardBody = (typeof AWARD_BODIES)[number];

/**
 * One award body as an image-led card: the backdrop of its latest top-prize
 * winner, darkened behind the text, easing in closer on hover or keyboard
 * focus. Without an image it falls back to the plain dark card. Counts are
 * omitted, not guessed, when the coverage fetch failed.
 */
export function AwardBodyCard({
  body,
  index,
  coverage,
  image,
}: {
  body: AwardBody;
  index: number;
  coverage: BodyCoverage | undefined;
  image: HubImage | undefined;
}) {
  return (
    <Reveal delay={(index % 2) * 0.1} className="h-full">
      <Link
        href={`/awards/${body.slug}`}
        className="group relative isolate flex h-full min-h-[22rem] flex-col justify-end overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b12] p-7 transition-colors duration-300 hover:border-accent/50 focus-visible:border-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 sm:p-8"
      >
        {image && (
          <>
            <Image
              src={image.src}
              alt=""
              fill
              sizes="(min-width: 640px) 50vw, 100vw"
              className="-z-20 object-cover opacity-80 transition-transform duration-300 ease-out group-hover:scale-105 group-focus-visible:scale-105"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_top,#0b0b12_28%,rgba(11,11,18,0.72)_52%,rgba(11,11,18,0.15)_100%)]"
            />
          </>
        )}

        <div className="flex items-baseline justify-between gap-4 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.2em]">
          <span className="text-accent">Reel {String(index + 1).padStart(2, "0")}</span>
          {coverage && (
            <span className="tabular-nums text-fg-muted">
              {coverage.firstYear}–{coverage.lastYear}
            </span>
          )}
        </div>

        <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold leading-tight tracking-tight text-fg-hi">
          {body.name}
        </h2>
        {coverage && (
          <p className="mt-2 text-sm tabular-nums text-fg-muted">
            {coverage.ceremonies.toLocaleString("en-US")} years on record ·{" "}
            {coverage.categories.toLocaleString("en-US")} categories across all years
          </p>
        )}
        <p className="mt-4 text-[15px] leading-7 text-fg-dim">{body.summary}</p>

        <span className="mt-6 flex items-center justify-between gap-4 text-sm font-medium text-fg-hi">
          <span className="transition-colors group-hover:text-accent-soft group-focus-visible:text-accent-soft">
            {body.explore}
          </span>
          <span
            aria-hidden
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/20 text-fg-muted transition-all duration-300 group-hover:translate-x-1 group-hover:border-accent group-hover:bg-accent group-hover:text-white group-focus-visible:border-accent group-focus-visible:bg-accent group-focus-visible:text-white"
          >
            →
          </span>
        </span>
        {image && (
          <span className="mt-4 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.16em] text-fg-faint">
            Pictured: {image.title} · {image.prize} {image.year}
          </span>
        )}
      </Link>
    </Reveal>
  );
}
