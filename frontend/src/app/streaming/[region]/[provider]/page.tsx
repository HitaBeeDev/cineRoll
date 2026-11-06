import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { AwardPageShell } from "@/features/awards/components/award-page-shell";
import { describeFilmList } from "@/features/collections/describe-film-list";
import { fetchRegionServices } from "@/features/streaming/fetch-region-services";
import { fetchSectionFilms } from "@/features/streaming/fetch-section-films";
import { findStreamingRegion } from "@/features/streaming/find-streaming-region";
import { SectionGrid } from "@/features/streaming/components/section-grid";
import { BODY_SECTIONS, HEADLINE_SECTIONS, type StreamingSection } from "@/features/streaming/streaming-sections";
import { buildItemList } from "@/lib/seo/build-item-list";
import { fitDescription } from "@/lib/seo/fit-description";
import { fitTitle } from "@/lib/seo/fit-title";
import { adTierSlugBase } from "@/lib/streaming/ad-tier-slug-base";
import { regionName } from "@/lib/streaming/region-name";

type Props = { params: Promise<{ region: string; provider: string }> };

// Rendered on first visit, then cached for a day — the streaming refresh runs daily.
export const revalidate = 86400;
export function generateStaticParams() {
  return [];
}

function listJoin(items: string[]): string {
  return items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
}

const ALL: StreamingSection = { key: "all", title: "Most awarded", params: {}, sort: "wins" };

async function findService(params: Props["params"]) {
  const { region: segment, provider } = await params;
  const region = findStreamingRegion(segment);
  if (!region) return null;
  const service = (await fetchRegionServices(region)).find((entry) => entry.slug === provider);
  return service ? { region, service } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = await findService(params);
  if (!found) return {};
  const { region, service } = found;
  const name = regionName(region);
  return {
    title: fitTitle(`Award-Winning Films on ${service.name} (${name})`, `Award Films on ${service.name}`),
    description: fitDescription(
      `${service.films} Oscar, Golden Globe, Cannes and Berlinale films streaming on ${service.name} in ${name}: Best Picture, Palme d'Or and Golden Bear winners and more.`,
    ),
    alternates: { canonical: `/streaming/${region.toLowerCase()}/${service.slug}` },
  };
}

export default async function StreamingServicePage({ params }: Props) {
  const found = await findService(params);
  if (!found) {
    // Ad tiers were folded into their main service; their old URLs were in the sitemap.
    const { region, provider } = await params;
    const base = adTierSlugBase(provider);
    if (base) permanentRedirect(`/streaming/${region.toLowerCase()}/${base}`);
    notFound();
  }
  const { region, service } = found;

  const scope = { provider: String(service.id), region };
  const [[all], headline, bodies] = await Promise.all([
    fetchSectionFilms([ALL], scope),
    fetchSectionFilms(HEADLINE_SECTIONS, scope),
    fetchSectionFilms(BODY_SECTIONS, scope),
  ]);
  if (!all) notFound();

  const name = regionName(region);
  const path = `/streaming/${region.toLowerCase()}/${service.slug}`;
  const regionPath = `/streaming/${region.toLowerCase()}`;
  const browse = (extra: Record<string, string>) =>
    `/browse?${new URLSearchParams({ ...extra, provider: String(service.id), region, sort: "wins" })}`;
  const title = `Award-winning films on ${service.name}`;

  return (
    <AwardPageShell
      crumbs={[
        { label: "Streaming", href: "/streaming" },
        { label: name, href: regionPath },
        { label: service.name, href: path },
      ]}
      title={`${title} in ${name}`}
      related={[{ href: regionPath, label: `Other services in ${name}` }]}
      intro={
        <>
          <p>
            {all.total} films nominated at the Oscars, Golden Globes, Cannes or the Berlinale are
            streaming on {service.name} in {name} as part of the subscription.
            {headline.length > 0 &&
              ` They include ${listJoin(headline.map((section) => `${section.total} ${section.prize} ${section.total === 1 ? "winner" : "winners"}`))}.`}
          </p>
          <p>{describeFilmList(all.films, all.total).join(" ")}</p>
          <p>
            Availability is checked weekly; data by JustWatch, via TMDB. To combine {service.name} with
            other filters — genre, decade, rating —{" "}
            <Link href={browse({})} className="text-fg-hi underline underline-offset-4 hover:text-accent">
              browse it
            </Link>
            .
          </p>
        </>
      }
    >
      <JsonLd data={buildItemList(`${title} in ${name}`, path, all.films)} />
      {headline.map((section) => (
        <SectionGrid key={section.key} section={section} title={`${section.title} on ${service.name}`} />
      ))}
      {bodies.map((section) => (
        <SectionGrid
          key={section.key}
          section={section}
          title={`${section.title} on ${service.name}`}
          moreHref={browse(section.params)}
        />
      ))}
      <SectionGrid section={all} title={`Most awarded on ${service.name}`} moreHref={browse({})} />
    </AwardPageShell>
  );
}
