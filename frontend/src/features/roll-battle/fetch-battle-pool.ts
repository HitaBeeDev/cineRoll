import { fetchRandom, type RollFilm } from "@/lib/api";
import {
  ROLL_BATTLE_CANDIDATE_POOL_SIZE,
  ROLL_BATTLE_SET_SIZE,
} from "./constants";
import { buildBattleCluster } from "./matchmaking/build-battle-cluster";

export async function fetchBattlePool(): Promise<RollFilm[]> {
  const requests = Array.from(
    { length: ROLL_BATTLE_CANDIDATE_POOL_SIZE },
    () => fetchRandom(),
  );
  const results = await Promise.allSettled(requests);
  const candidates = results.flatMap((result) =>
    result.status === "fulfilled" ? [result.value.film] : [],
  );
  const cluster = buildBattleCluster(candidates, ROLL_BATTLE_SET_SIZE);

  if (cluster.length < ROLL_BATTLE_SET_SIZE) {
    throw new Error("Not enough films were available for Roll Battle");
  }
  return cluster;
}
