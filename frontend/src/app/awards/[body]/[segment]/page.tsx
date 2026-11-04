import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { buildItemList } from "@/lib/seo/build-item-list";
import { awardSegmentCopy } from "@/features/awards/award-segment-copy";
import { awardSegmentIntro } from "@/features/awards/award-segment-intro";
import { AwardPageShell } from "@/features/awards/components/award-page-shell";
import { AwardSegmentView } from "@/features/awards/components/award-segment-view";
import { findAwardBody } from "@/features/awards/find-award-body";
import { segmentFilms } from "@/features/awards/segment-films";
import { type AwardSegment, resolveAwardSegment } from "@/features/awards/resolve-award-segment";

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
      related={segmentRelated(resolved, body, awardBody.shortName)}
      intro={awardSegmentIntro(resolved).map((p) => <p key={p.slice(0, 24)}>{p}</p>)}
    >
      <JsonLd data={buildItemList(copy.h1, `/awards/${body}/${segment}`, segmentFilms(resolved))} />
      <AwardSegmentView segment={resolved} />
    </AwardPageShell>
  );
}

// A prize's complete winners' list, where there is one.
const COLLECTION_FOR_CATEGORY: Record<string, { href: string; label: string }> = {
  "best-picture": { href: "/collections/best-picture-winners", label: "Every Best Picture winner" },
  "palme-d-or": { href: "/collections/palme-dor-winners", label: "Every Palme d'Or winner" },
  "golden-bear": { href: "/collections/golden-bear-winners", label: "Every Golden Bear winner" },
  "international-feature-film": {
    href: "/collections/international-feature-winners",
    label: "Every International Feature winner",
  },
};

function segmentRelated(resolved: AwardSegment, body: string, shortName: string) {
  const hub = { href: `/awards/${body}`, label: `All ${shortName} years and categories` };
  if (resolved.kind === "year") {
    const decade = Math.floor(resolved.data.year / 10) * 10;
    return [hub, { href: `/decades/${decade}s`, label: `Best films of the ${decade}s` }];
  }
  if (resolved.kind === "category") {
    const collection = COLLECTION_FOR_CATEGORY[resolved.data.slug];
    return collection ? [collection, hub] : [hub];
  }
  return [hub, { href: "/tools/random-movie-by-genre", label: "Random movie by genre" }];
}
