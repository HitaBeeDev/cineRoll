import { filtersToParams } from "@/lib/api/filters-to-params";
import { requestRandom } from "@/lib/api/fetch-random/request-random";
import type { RandomResult } from "@/lib/api/roll-types";

export type TonightRequest = {
  region: string;
  providers: number[];
  runtimeMax: number | null;
  excludeIds: string[];
};

/**
 * One feature film for tonight from the roll engine. With services picked it
 * must be on one of them in that country; with none, on any subscription
 * service there (`streamsIn`, which needs no provider ids).
 */
export function rollTonight(request: TonightRequest): Promise<RandomResult> {
  const params = filtersToParams({
    contentTypes: ["movie"],
    runtimeMax: request.runtimeMax,
    providers: request.providers,
    streamingRegion: request.providers.length > 0 ? request.region : "",
  });
  if (request.providers.length === 0) params.set("streamsIn", request.region);
  if (request.excludeIds.length > 0) params.set("excludeIds", request.excludeIds.join(","));
  return requestRandom(params);
}
