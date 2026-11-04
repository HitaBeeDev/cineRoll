import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { AwardCategoryYearPayload } from "@/features/awards/award-types";
import { AwardEntryList } from "@/features/awards/components/award-entry-list";
import { AwardPageShell } from "@/features/awards/components/award-page-shell";
import { AwardYearNav } from "@/features/awards/components/award-year-nav";
import { fetchAward } from "@/features/awards/fetch-award";
import { findAwardBody } from "@/features/awards/find-award-body";

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
    title: `${data.year} ${data.shortName} ${data.name}: Winner and Nominees`,
    description: `${winner ? `${winner.film.title} won the ${data.year} ${data.shortName} ${data.name}. ` : ""}See all ${data.entries.length} nominees.`,
    alternates: { canonical: `/awards/${data.body}/${data.slug}/${data.year}` },
  };
}

export default async function AwardCategoryYearPage({ params }: Props) {
  const data = await load(params);
  if (!data) notFound();

  const awardBody = findAwardBody(data.body)!;
  const winners = data.entries.filter((entry) => entry.won);
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
      intro={
        <p>
          {winners.length > 0
            ? `${winners.map((w) => w.film.title).join(" and ")} won ${data.name} at the ${data.year} ${data.shortName}. `
            : ""}
          All {data.entries.length} nominees are listed below, winner first.
        </p>
      }
    >
      <AwardEntryList entries={data.entries} />
      <AwardYearNav basePath={base} label={data.name} prev={data.prev} next={data.next} />
    </AwardPageShell>
  );
}
