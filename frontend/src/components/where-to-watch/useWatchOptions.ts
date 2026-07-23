"use client";

import type { Provider } from "@/components/where-to-watch/types";
import { parseProviders } from "@/components/where-to-watch/parse-providers";
import { useDetectedCountry } from "@/components/where-to-watch/useDetectedCountry";

export type WatchOptions =
  | { status: "pending" }
  | { status: "empty" }
  | {
      status: "ready";
      flatrate: Provider[];
      rent: Provider[];
      buy: Provider[];
      link: string | undefined;
    };

/**
 * Resolves the streaming options to show for the viewer's country:
 *  - "pending" while the country is still being detected (hold to avoid a flash),
 *  - "empty" when there's nothing to stream/rent/buy,
 *  - "ready" with the grouped providers otherwise.
 */
export function useWatchOptions(
  watchProviders: Record<string, unknown> | null,
): WatchOptions {
  const country = useDetectedCountry();
  const noData = !watchProviders;

  if (!noData && country === null) return { status: "pending" };

  const providers = watchProviders ? parseProviders(watchProviders) : {};
  const countryData = country ? providers[country] : undefined;
  const flatrate = countryData?.flatrate ?? [];
  const rent = countryData?.rent ?? [];
  const buy = countryData?.buy ?? [];

  if (flatrate.length === 0 && rent.length === 0 && buy.length === 0) {
    return { status: "empty" };
  }

  return { status: "ready", flatrate, rent, buy, link: countryData?.link };
}
