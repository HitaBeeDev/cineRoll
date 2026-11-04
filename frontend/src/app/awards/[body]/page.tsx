import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { buildLinkItemList } from "@/lib/seo/build-link-item-list";
import { AWARD_BODIES } from "@/features/awards/award-bodies";
import type { AwardBodyPayload } from "@/features/awards/award-types";
import { AwardPageShell } from "@/features/awards/components/award-page-shell";
import { AwardSectionTitle } from "@/features/awards/components/award-section-title";
import { fetchAward } from "@/features/awards/fetch-award";
import { findAwardBody } from "@/features/awards/find-award-body";

type Props = { params: Promise<{ body: string }> };

// Rendered on first visit, then cached for a day — never at build time, where a
// backend that is down (or older than this frontend) would fail the build or
// bake a 404 in. Unknown slugs 404 via findAwardBody.
export const revalidate = 86400;
export function generateStaticParams() {
  return [];
}

const CHIP =
  "rounded-md border border-edge px-3 py-1.5 text-sm text-fg-dim transition-colors hover:border-edge-hover hover:text-fg-hi";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const body = findAwardBody((await params).body);
  if (!body) return {};
  return {
    title: `${body.shortName} Winners and Nominees by Year`,
    description: `Every ${body.name} ceremony and category: ${body.headline} winners, nominees year by year, and award-winning films by genre.`,
    alternates: { canonical: `/awards/${body.slug}` },
  };
}

export default async function AwardBodyPage({ params }: Props) {
  const body = findAwardBody((await params).body);
  if (!body) notFound();
  const data = await fetchAward<AwardBodyPayload>(body.slug);
  if (!data) notFound();

  const decades = new Map<number, number[]>();
  for (const { year } of data.years) {
    const decade = Math.floor(year / 10) * 10;
    decades.set(decade, [...(decades.get(decade) ?? []), year]);
  }
  const headline = data.categories.find((category) => category.name === body.headline);

  return (
    <AwardPageShell
      crumbs={[
        { label: "Awards", href: "/awards" },
        { label: body.shortName, href: `/awards/${body.slug}` },
      ]}
      title={`${body.name}: Winners and Nominees`}
      related={AWARD_BODIES.filter((other) => other.slug !== body.slug).map((other) => ({
        href: `/awards/${other.slug}`,
        label: `${other.shortName} winners and nominees`,
      }))}
      intro={
        <>
          {body.intro.map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
          <p>
            CineRoll holds {data.years.length} {body.shortName} ceremonies, from{" "}
            {data.years[0]?.year} to {data.years.at(-1)?.year}, with{" "}
            {data.categories.length} categories big enough for their own page
            {data.genres.length > 0 ? ` and ${data.genres.length} genres` : ""}.
          </p>
          {headline && (
            <p>
              Start with the top prize:{" "}
              <Link href={`/awards/${body.slug}/${headline.slug}`} className="text-fg-hi underline underline-offset-4 hover:text-accent">
                every {headline.name} winner and nominee
              </Link>
              .
            </p>
          )}
        </>
      }
    >
      <JsonLd
        data={buildLinkItemList(
          `${body.name} categories`,
          `/awards/${body.slug}`,
          data.categories.map((category) => ({ path: `/awards/${body.slug}/${category.slug}`, name: category.name })),
        )}
      />
      <section aria-labelledby="by-year">
        <AwardSectionTitle id="by-year">By year</AwardSectionTitle>
        <div className="mt-4 space-y-3">
          {[...decades].reverse().map(([decade, years]) => (
            <div key={decade} className="flex flex-wrap items-center gap-2">
              <span className="w-14 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.16em] text-fg-muted">
                {decade}s
              </span>
              {years.map((year) => (
                <Link key={year} href={`/awards/${body.slug}/${year}`} className={CHIP}>
                  {year}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="by-category">
        <AwardSectionTitle id="by-category">By category</AwardSectionTitle>
        <ul className="mt-4 grid gap-x-6 sm:grid-cols-2">
          {data.categories.map((category) => (
            <li key={category.slug} className="border-b border-white/5 py-2.5">
              <Link href={`/awards/${body.slug}/${category.slug}`} className="text-fg-hi hover:text-accent">
                {category.name}
              </Link>
              <span className="ml-2 text-sm text-fg-muted">
                {category.firstYear}–{category.lastYear} · {category.films} films
              </span>
            </li>
          ))}
        </ul>
      </section>

      {data.genres.length > 0 && (
        <section aria-labelledby="by-genre">
          <AwardSectionTitle id="by-genre">By genre</AwardSectionTitle>
          <div className="mt-4 flex flex-wrap gap-2">
            {data.genres.map((genre) => (
              <Link key={genre.slug} href={`/awards/${body.slug}/${genre.slug}`} className={CHIP}>
                {genre.name} <span className="text-fg-muted">· {genre.films}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </AwardPageShell>
  );
}
