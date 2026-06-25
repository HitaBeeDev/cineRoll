import { statsPayload } from "./mapper";
import { getStatsRows } from "./repository";

export async function getStats() {
  return statsPayload(await getStatsRows());
}
