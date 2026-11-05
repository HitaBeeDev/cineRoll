"use client";

import { ExternalLink } from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";
import type { WatchProviders } from "@cineroll/types";
import { EditorialSectionLabel } from "@/components/editorial-section-label";
import { serverDefaultRegion } from "../watch/server-default-region";
import { regionName } from "@/lib/streaming/region-name";
import { tmdbWatchUrl } from "../watch/tmdb-watch-url";
import { useRegionParam } from "../watch/use-region-param";
import { useViewerRegion } from "@/lib/streaming/use-viewer-region";
import { MetaHeading } from "./meta-heading";

const AS_OF = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" });

/**
 * Subscription services the title streams on, for one country at a time. The
 * server renders a fixed default (so the HTML is cacheable and crawlable);
 * after hydration `?region=XX` or the viewer's own country takes over.
 */
export function WhereToStreamSection({
  watchProviders,
  tmdbId,
  contentType,
}: {
  watchProviders: WatchProviders | null | undefined;
  tmdbId: number | null;
  contentType: string;
}) {
  const regions = useMemo(() => watchProviders?.regions ?? [], [watchProviders]);
  const viewerRegion = useViewerRegion();
  // ?region= (a shared link or the viewer's pick) wins; else their own
  // country; else the server default.
  const [regionParam, setRegionParam] = useRegionParam();

  const options = useMemo(() => {
    const codes = new Set(regions.map((entry) => entry.country));
    if (viewerRegion) codes.add(viewerRegion);
    if (regionParam) codes.add(regionParam);
    return [...codes].sort((a, b) => regionName(a).localeCompare(regionName(b)));
  }, [regions, viewerRegion, regionParam]);

  if (regions.length === 0) return null;

  const region = regionParam ?? viewerRegion ?? serverDefaultRegion(regions);

  const providers = regions.find((entry) => entry.country === region)?.providers ?? [];
  const asOf = watchProviders?.asOf ? new Date(watchProviders.asOf) : null;

  return (
    <section id="where-to-stream">
      <EditorialSectionLabel>Where to stream</EditorialSectionLabel>
      <div className="mt-8 space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="stream-region">
            <MetaHeading>Country</MetaHeading>
          </label>
          <select
            id="stream-region"
            value={region}
            onChange={(event) => setRegionParam(event.target.value)}
            className="border border-[#25253a] bg-[#0d0d18] px-3 py-2 text-sm text-[#d0d0e8] transition-colors hover:border-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
          >
            {options.map((code) => (
              <option key={code} value={code}>
                {regionName(code)}
              </option>
            ))}
          </select>
        </div>

        {providers.length > 0 ? (
          <ul className="flex flex-wrap gap-2" aria-label={`Streaming services in ${regionName(region)}`}>
            {providers.map((provider) => (
              <li
                key={provider.name}
                className="flex items-center gap-2.5 border border-[#25253a] py-1.5 pl-1.5 pr-3.5 text-sm text-[#d0d0e8]"
              >
                {provider.logoPath ? (
                  <Image
                    src={`https://image.tmdb.org/t/p/w92${provider.logoPath}`}
                    alt=""
                    width={24}
                    height={24}
                    unoptimized
                    className="h-6 w-6 rounded-sm"
                  />
                ) : (
                  <span className="h-6 w-1" aria-hidden />
                )}
                {provider.name}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-[#9898b8]">
            Not on a subscription service in {regionName(region)}. Pick another country, or check
            rent and buy options below.
          </p>
        )}

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#7c7ca0]">
          <p>
            Subscription services only
            {asOf && !Number.isNaN(asOf.getTime()) && (
              <>
                {" "}· checked <time dateTime={asOf.toISOString()}>{AS_OF.format(asOf)}</time>
              </>
            )}{" "}
            · data by JustWatch
          </p>
          {tmdbId && (
            <a
              href={tmdbWatchUrl(tmdbId, contentType, region)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[#9898b8] underline decoration-white/20 underline-offset-4 transition-colors hover:text-accent"
            >
              Rent, buy and all options
              <ExternalLink className="h-3 w-3" aria-hidden />
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
