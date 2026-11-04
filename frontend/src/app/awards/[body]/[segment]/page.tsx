import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { awardSegmentCopy } from "@/features/awards/award-segment-copy";
import { awardSegmentIntro } from "@/features/awards/award-segment-intro";
import { AwardPageShell } from "@/features/awards/components/award-page-shell";
import { AwardSegmentView } from "@/features/awards/components/award-segment-view";
import { findAwardBody } from "@/features/awards/find-award-body";
import { resolveAwardSegment } from "@/features/awards/resolve-award-segment";

type Props = { params: Promise<{ body: string; segment: string }> };

// Rendered on first visit, then cached for a day (hundreds of pages; building
// them all at deploy would cost hundreds of API calls per build).
export const revalidate = 86400;
export function generateStaticParams() {
  return [];
}

async function load(params: Props["params"]) {
  const { body, segment } = await params;
  if (!findAwardBody(body)) return null;
  return resolveAwardSegment(body, segment);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolved = await load(params);
  if (!resolved) return {};
  const { title, description } = awardSegmentCopy(resolved);
  const { body, segment } = await params;
  return { title, description, alternates: { canonical: `/awards/${body}/${segment}` } };
}

export default async function AwardSegmentPage({ params }: Props) {
  const resolved = await load(params);
  if (!resolved) notFound();

  const { body, segment } = await params;
  const awardBody = findAwardBody(body)!;
  const copy = awardSegmentCopy(resolved);
  const crumbLabel =
    resolved.kind === "year" ? String(resolved.data.year) : resolved.data.name;

  return (
    <AwardPageShell
      crumbs={[
        { label: "Awards", href: "/awards" },
        { label: awardBody.shortName, href: `/awards/${body}` },
        { label: crumbLabel, href: `/awards/${body}/${segment}` },
      ]}
      title={copy.h1}
      intro={awardSegmentIntro(resolved).map((p) => <p key={p.slice(0, 24)}>{p}</p>)}
    >
      <AwardSegmentView segment={resolved} />
    </AwardPageShell>
  );
}
