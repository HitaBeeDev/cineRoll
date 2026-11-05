import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { AwardPageShell } from "@/features/awards/components/award-page-shell";
import { fetchRegionServices } from "@/features/streaming/fetch-region-services";
import { fetchSectionFilms } from "@/features/streaming/fetch-section-films";
import { findStreamingRegion } from "@/features/streaming/find-streaming-region";
import { ServiceList } from "@/features/streaming/components/service-list";
import { SectionGrid } from "@/features/streaming/components/section-grid";
import { BODY_SECTIONS } from "@/features/streaming/streaming-sections";
import { buildLinkItemList } from "@/lib/seo/build-link-item-list";
import { fitDescription } from "@/lib/seo/fit-description";
import { fitTitle } from "@/lib/seo/fit-title";
import { regionName } from "@/lib/streaming/region-name";

type Props = { params: Promise<{ region: string }> };

// Rendered on first visit, then cached for a day — the streaming refresh runs daily.
export const revalidate = 86400;
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const region = findStreamingRegion((await params).region);
  if (!region) return {};
  const name = regionName(region);
  return {
    title: fitTitle(`Award-Winning Films Streaming in ${name}`, `Streaming in ${name}`),
    description: fitDescription(
      `Oscar, Golden Globe, Cannes and Berlinale winners you can stream by subscription in ${name} right now, and the services that carry them.`,
    ),
    alternates: { canonical: `/streaming/${region.toLowerCase()}` },
  };
}

export default async function StreamingRegionPage({ params }: Props) {
  const region = findStreamingRegion((await params).region);
  if (!region) notFound();

  const [services, sections] = await Promise.all([
    fetchRegionServices(region),
    fetchSectionFilms(BODY_SECTIONS, { streamsIn: region }),
  ]);
  if (services.length === 0 && sections.length === 0) notFound();

  const name = regionName(region);
  const path = `/streaming/${region.toLowerCase()}`;
  const top = services.slice(0, 3).map((service) => `${service.name} (${service.films})`);

  return (
    <AwardPageShell
      crumbs={[
        { label: "Streaming", href: "/streaming" },
        { label: name, href: path },
      ]}
      title={`Award-winning films streaming in ${name}`}
      related={[{ href: "/streaming", label: "Other countries" }]}
      intro={
        <>
          <p>
            Films nominated at the Oscars, Golden Globes, Cannes or the Berlinale that you can stream
            by subscription in {name} — no renting or buying.
            {top.length > 0 && ` The services with the most of them are ${top.join(", ")}.`}
          </p>
          <p>
            Below are the services with a page of their own, then the winners at each award that are
            streaming now. Availability is checked weekly; data by JustWatch, via TMDB.
          </p>
        </>
      }
    >
      <JsonLd
        data={buildLinkItemList(
          `Streaming services in ${name}`,
          path,
          services.map((service) => ({ path: `${path}/${service.slug}`, name: service.name })),
        )}
      />
      {services.length > 0 && (
        <section aria-labelledby="services-title">
          <h2
            id="services-title"
            className="font-[family-name:var(--font-geist-mono)] text-[11px] font-semibold uppercase tracking-[0.4em] text-accent"
          >
            Services
          </h2>
          <div className="mt-5">
            <ServiceList region={region} services={services} />
          </div>
        </section>
      )}
      {sections.map((section) => (
        <SectionGrid key={section.key} section={section} title={`${section.title} streaming now`} />
      ))}
    </AwardPageShell>
  );
}
