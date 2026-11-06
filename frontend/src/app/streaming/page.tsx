import type { Metadata } from "next";
import Link from "next/link";
import { AwardPageShell } from "@/features/awards/components/award-page-shell";
import { regionName } from "@/lib/streaming/region-name";
import { STREAMING_REGIONS } from "@/lib/streaming/streaming-regions";

export const metadata: Metadata = {
  alternates: { canonical: "/streaming" },
  title: "Where to Watch Award-Winning Movies Online",
  description:
    "Find where to watch award-winning movies online. Choose your country to see Oscar, Golden Globe, Cannes and Berlinale films on subscription streaming services.",
};

const REGIONS = [...STREAMING_REGIONS]
  .map((code) => ({ code, name: regionName(code) }))
  .sort((a, b) => a.name.localeCompare(b.name));

export default function StreamingIndexPage() {
  return (
    <AwardPageShell
      crumbs={[{ label: "Streaming", href: "/streaming" }]}
      title="Where to watch award-winning movies online"
      intro={
        <>
          <p>
            Which Oscar, Golden Globe, Cannes and Berlinale films can you watch tonight without
            renting or buying? What is on Netflix, MUBI or Prime Video depends on where you live, so
            pick your country first.
          </p>
          <p>
            Each country page lists the subscription services that carry award films there and the
            winners streaming now, award by award. Availability is checked against TMDB every week;
            the data comes from JustWatch.
          </p>
        </>
      }
    >
      <section aria-labelledby="regions-title">
        <h2
          id="regions-title"
          className="font-[family-name:var(--font-geist-mono)] text-[11px] font-semibold uppercase tracking-[0.4em] text-accent"
        >
          Countries
        </h2>
        <ul className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {REGIONS.map((region) => (
            <li key={region.code}>
              <Link
                href={`/streaming/${region.code.toLowerCase()}`}
                className="block rounded-md border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-fg-hi transition-colors hover:border-accent/40"
              >
                {region.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </AwardPageShell>
  );
}
