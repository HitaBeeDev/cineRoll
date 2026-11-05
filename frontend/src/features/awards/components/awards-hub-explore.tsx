import Link from "next/link";
import { Reveal } from "@/components/cinematic/reveal";

const LINK_CLASS =
  "text-fg-hi underline decoration-white/25 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent/60";

/** The hub's second intro paragraph, set after the cards so the hero stays short. */
export function AwardsHubExplore() {
  return (
    <Reveal>
      <section className="grid gap-6 lg:grid-cols-[9rem_1fr] lg:gap-10">
        <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.2em] text-accent lg:pt-3">
          Go deeper
        </p>
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-fg-hi sm:text-4xl">
            Four awards, one record
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-fg-dim sm:text-[17px] sm:leading-8">
            CineRoll covers the four awards that shape film history: the Oscars, the Golden Globes,
            the Cannes Film Festival and the Berlinale. Pick one to see every ceremony, every
            category, and every film that won or was nominated. For the complete winners&apos;
            lists of the biggest prizes, see the{" "}
            <Link href="/collections" className={LINK_CLASS}>
              collections
            </Link>
            , or browse the best films{" "}
            <Link href="/decades" className={LINK_CLASS}>
              by decade
            </Link>
            ,{" "}
            <Link href="/countries" className={LINK_CLASS}>
              country
            </Link>{" "}
            or{" "}
            <Link href="/languages" className={LINK_CLASS}>
              language
            </Link>
            , or{" "}
            <Link href="/moods" className={LINK_CLASS}>
              by mood
            </Link>
            .
          </p>
        </div>
      </section>
    </Reveal>
  );
}
