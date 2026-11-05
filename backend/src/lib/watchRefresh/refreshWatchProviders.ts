import type { WatchProviders, WatchRegion } from "@cineroll/types";
import type { WatchFetchResult } from "./fetchWatchRegions";
import { sameServices } from "./sameServices";

export type DueFilm = {
  id: string;
  tmdbId: number;
  contentType: string;
  watchProviders: WatchProviders | null;
};

export type RefreshDeps = {
  /** Films with a TMDB id, least recently checked first (never-checked first of all). */
  findDue: (limit: number) => Promise<DueFilm[]>;
  countRefreshable: () => Promise<number>;
  fetchRegions: (tmdbId: number, contentType: string) => Promise<WatchFetchResult>;
  /** Store the answer; `changed` decides whether the film's updatedAt moves. */
  save: (id: string, value: WatchProviders, changed: boolean) => Promise<void>;
  now: () => Date;
};

export type RefreshOptions = {
  /** Every film is re-checked once per this many runs (daily runs → weekly). */
  cycleRuns: number;
  /** Stop starting new fetches after this long, so the function never times out. */
  budgetMs: number;
  concurrency: number;
};

export type RefreshReport = {
  due: number;
  checked: number;
  changed: number;
  failed: number;
  rateLimited: boolean;
  outOfTime: boolean;
};

/**
 * One run of the streaming refresh: take the stalest 1/cycleRuns of the
 * catalogue and ask TMDB again. Oldest-first means a run cut short by time,
 * errors or TMDB rate limits is simply caught up by the next one — there is
 * no cursor to lose.
 */
export async function refreshWatchProviders(deps: RefreshDeps, options: RefreshOptions): Promise<RefreshReport> {
  const started = deps.now().getTime();
  const total = await deps.countRefreshable();
  const due = await deps.findDue(Math.ceil(total / options.cycleRuns));
  const report: RefreshReport = { due: due.length, checked: 0, changed: 0, failed: 0, rateLimited: false, outOfTime: false };

  let next = 0;
  const worker = async () => {
    while (next < due.length) {
      if (report.rateLimited) return;
      if (deps.now().getTime() - started > options.budgetMs) {
        report.outOfTime = true;
        return;
      }
      const film = due[next++]!;
      const result = await deps.fetchRegions(film.tmdbId, film.contentType);

      if (result.status === "rate-limited") {
        report.rateLimited = true;
        return;
      }
      if (result.status === "error") {
        report.failed++;
        continue;
      }

      const regions: WatchRegion[] = result.status === "ok" ? result.regions : [];
      const changed = !sameServices(film.watchProviders?.regions ?? [], regions);
      await deps.save(film.id, { asOf: deps.now().toISOString(), regions }, changed);
      report.checked++;
      if (changed) report.changed++;
    }
  };

  await Promise.all(Array.from({ length: options.concurrency }, worker));
  return report;
}
