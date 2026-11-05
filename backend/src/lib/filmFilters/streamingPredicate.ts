import { Prisma } from "@prisma/client";

import type { ListQuery } from "./listQuerySchema";

/**
 * "Streams on `provider` in `region`" as one jsonb containment test: some
 * element of `regions` has that country AND a provider with that id. `@>`
 * matches nested arrays element-wise, so the country and the provider must sit
 * in the SAME region object — Netflix in the US does not satisfy "Netflix in
 * Germany". Records seeded before the refresh job reached them carry no ids
 * yet, so they cannot match until refreshed (at most a week).
 */
export function streamingPredicate(query: Pick<ListQuery, "provider" | "region">): Prisma.Sql | undefined {
  if (!query.provider || query.provider.length === 0) return undefined;

  // One containment test per service, OR'd: on any of the viewer's services.
  const arms = query.provider.map(id => {
    const region: Record<string, unknown> = { providers: [{ id }] };
    if (query.region) region.country = query.region;
    return Prisma.sql`"Film"."watchProviders" @> ${JSON.stringify({ regions: [region] })}::jsonb`;
  });
  return Prisma.sql`(${Prisma.join(arms, " OR ")})`;
}

/**
 * "Streams on any service in `streamsIn`". A region entry only exists when it
 * lists at least one service (see tmdbWatchRegions / toWatchProviders), so the
 * country alone is enough to test for.
 */
export function streamsInPredicate(query: Pick<ListQuery, "streamsIn">): Prisma.Sql | undefined {
  if (!query.streamsIn) return undefined;
  return Prisma.sql`"Film"."watchProviders" @> ${JSON.stringify({ regions: [{ country: query.streamsIn }] })}::jsonb`;
}
