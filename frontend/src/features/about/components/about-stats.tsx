import { AWARD_BODIES } from "@/features/awards/award-bodies";
import type { BodyCoverage } from "@/features/methodology/coverage-types";
import { AboutReveal } from "./about-reveal";

type Stat = { value: string; label: string };

/**
 * The archive's proof in four numbers, read live from the API. A number that
 * could not be fetched is dropped rather than guessed.
 */
export function AboutStats({
  archiveSize,
  coverage,
}: {
  archiveSize: number | null;
  coverage: BodyCoverage[];
}) {
  const stats: Stat[] = [];
  if (archiveSize) stats.push({ value: archiveSize.toLocaleString("en-US"), label: "Films & series" });
  stats.push({ value: String(AWARD_BODIES.length), label: "Award bodies" });
  if (coverage.length > 0) {
    const ceremonies = coverage.reduce((sum, body) => sum + body.ceremonies, 0);
    const firstYear = Math.min(...coverage.map((body) => body.firstYear));
    stats.push({ value: ceremonies.toLocaleString("en-US"), label: "Ceremonies on record" });
    stats.push({ value: String(firstYear), label: "Earliest year" });
  }

  return (
    <section aria-label="CineRoll in numbers" className="border-b border-white/10 bg-[#0a0a10]">
      <dl className="mx-auto grid max-w-5xl grid-cols-2 sm:grid-cols-4">
        {stats.map((stat, index) => (
          <AboutReveal
            key={stat.label}
            delay={index * 0.08}
            className="border-white/10 px-6 py-8 [&:not(:first-child)]:border-l max-sm:[&:nth-child(3)]:border-l-0 max-sm:[&:nth-child(n+3)]:border-t lg:px-10"
          >
            <dt className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.2em] text-fg-faint">
              {stat.label}
            </dt>
            <dd className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold tabular-nums text-fg-hi sm:text-4xl">
              {stat.value}
            </dd>
          </AboutReveal>
        ))}
      </dl>
    </section>
  );
}
