import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/cinematic/reveal";
import type { HubImage } from "../hub/hub-types";

// A loose fan: each poster nudged up or down and tilted a little, so the group
// reads as prints laid on a table rather than a grid.
const PLACEMENT = [
  "lg:-rotate-6 lg:translate-y-6",
  "lg:-rotate-2 lg:-translate-y-4",
  "lg:rotate-2 lg:translate-y-8",
  "lg:rotate-6 lg:-translate-y-2",
];

/**
 * Real top-prize winners' posters beside the hub heading. They enter once,
 * staggered; edges fade into the hero so they sit in the dark, not on it.
 * Each poster is a link to its film.
 */
export function HeroPosterStack({ posters }: { posters: HubImage[] }) {
  if (posters.length === 0) return null;

  return (
    <div className="relative [mask-image:linear-gradient(to_bottom,black_70%,transparent)] lg:[mask-image:radial-gradient(ellipse_75%_80%_at_55%_50%,black_55%,transparent_100%)]">
      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent opacity-[0.12] blur-[90px]"
      />
      <ul className="flex gap-3 lg:-space-x-8 lg:gap-0 lg:py-10">
        {posters.slice(0, 4).map((poster, index) => (
          <li key={poster.slug} className={`w-1/4 lg:w-40 ${PLACEMENT[index] ?? ""}`}>
            <Reveal delay={0.15 + index * 0.08}>
              <Link
                href={`/film/${poster.slug}`}
                aria-label={`${poster.title} — ${poster.prize}, ${poster.year}`}
                className="group block overflow-hidden rounded-md shadow-[0_20px_50px_rgba(0,0,0,0.6)] ring-1 ring-white/10 transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <Image
                  src={poster.src}
                  alt=""
                  width={342}
                  height={513}
                  priority={index < 2}
                  className="aspect-[2/3] h-auto w-full object-cover"
                />
              </Link>
            </Reveal>
          </li>
        ))}
      </ul>
    </div>
  );
}
