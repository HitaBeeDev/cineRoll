import { fitDescription } from "@/lib/seo/fit-description";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { AwardCategoryYearPayload } from "@/features/awards/award-types";
import { AwardEntryList } from "@/features/awards/components/award-entry-list";
import { AwardPageShell } from "@/features/awards/components/award-page-shell";
import { AwardYearNav } from "@/features/awards/components/award-year-nav";
import { fetchAward } from "@/features/awards/fetch-award";
import { findAwardBody } from "@/features/awards/find-award-body";
import { shortCategoryName } from "@/features/awards/short-category-name";
import { fitTitle } from "@/lib/seo/fit-title";

type Props = { params: Promise<{ body: string; segment: string; year: string }> };

// Rendered on first visit, then cached for a day.
export const revalidate = 86400;
export function generateStaticParams() {
  return [];
}

async function load(params: Props["params"]) {
  const { body, segment, year } = await params;
  if (!findAwardBody(body) || !/^\d{4}$/.test(year)) return null;
  return fetchAward<AwardCategoryYearPayload>(`${body}/categories/${segment}/${year}`);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await load(params);
  if (!data) return {};
  const winner = data.entries.find((entry) => entry.won);
  return {
    title: fitTitle(
      `${data.year} ${data.shortName} ${data.name}: Winner and Nominees`,
      `${data.year} ${data.shortName} ${shortCategoryName(data.name)} Winner`,
      `${data.year} ${shortCategoryName(data.name)}`,
    ),
    description: fitDescription(`${winner ? `${winner.film.title} won the ${data.year} ${data.shortName} ${data.name}. ` : ""}See all ${data.entries.length} nominees.`),
    alternates: { canonical: `/awards/${data.body}/${data.slug}/${data.year}` },
  };
}

export default async function AwardCategoryYearPage({ params }: Props) {
  const data = await load(params);
  if (!data) notFound();

  const awardBody = findAwardBody(data.body)!;
  const winners = data.entries.filter((entry) => entry.won);
  const others = [...new Set(data.entries.filter((entry) => !entry.won).map((entry) => entry.film.title))];
  const base = `/awards/${data.body}/${data.slug}`;

  return (
    <AwardPageShell
      crumbs={[
        { label: "Awards", href: "/awards" },
        { label: awardBody.shortName, href: `/awards/${data.body}` },
        { label: data.name, href: base },
        { label: String(data.year), href: `${base}/${data.year}` },
      ]}
      title={`${data.year} ${data.shortName} — ${data.name}`}
      related={[
        { href: base, label: `Every ${data.name} winner and nominee` },
        { href: `/awards/${data.body}/${data.year}`, label: `All ${data.year} ${data.shortName} categories` },
      ]}
      intro={
        <p>
          {winners.length > 0
            ? `${winners.map((w) => w.film.title).join(" and ")} won ${data.name} at the ${data.year} ${data.shortName}. `
            : ""}
          All {data.entries.length} nominees are listed below, winner first.
          {others.length > 0 &&
            ` The other nominees were ${others.length > 1 ? `${others.slice(0, -1).join(", ")} and ${others.at(-1)}` : others[0]}.`}{" "}
          Each film links to its complete award history.
          {data.prev || data.next
            ? ` The links below go to the ${[data.prev, data.next].filter(Boolean).join(" and ")} ${data.name} ${data.prev && data.next ? "races" : "race"}.`
            : ""}
        </p>
      }
    >
      <AwardEntryList entries={data.entries} />
      <AwardYearNav basePath={base} label={data.name} prev={data.prev} next={data.next} />
    </AwardPageShell>
  );
}
