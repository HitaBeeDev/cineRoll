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
  if (!query.provider) return undefined;

  const region: Record<string, unknown> = { providers: [{ id: query.provider }] };
  if (query.region) region.country = query.region;

  return Prisma.sql`"Film"."watchProviders" @> ${JSON.stringify({ regions: [region] })}::jsonb`;
}
