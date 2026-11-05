import type { ProviderFacetCount } from "@cineroll/types";

// The URL carries only the provider id (`provider=8`). Names arrive with the
// facet counts; remembering them here lets the active-filter chip say
// "Netflix" instead of a number, without putting the name in the URL.
const names = new Map<number, string>();

export function rememberProviderNames(providers: ProviderFacetCount[]): void {
  for (const provider of providers) names.set(Number(provider.value), provider.name);
}

/** The service's name once the facets have loaded; a neutral label before. */
export function providerName(id: number): string {
  return names.get(id) ?? "Streaming service";
}
