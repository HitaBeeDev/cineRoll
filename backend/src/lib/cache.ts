import type { Response } from "express";

export function setPublicCache(res: Response, seconds: number) {
  res.set("Cache-Control", `public, max-age=${seconds}`);
}

// ── Application cache ─────────────────────────────────────────────────────────
//
// Redis-ready interface, in-memory LRU implementation. Hot reads call
// `cache.getOrSet(key, ttl, loader)`; the only thing to swap for Redis later is
// the store implementation behind this interface — call sites don't change. The
// interface is async for exactly that reason (a network store returns promises).

export interface CacheStore {
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T, ttlMs: number): Promise<void>;
  getOrSet<T>(key: string, ttlMs: number, loader: () => Promise<T>): Promise<T>;
  delete(key: string): Promise<void>;
  /** Drop every key with this prefix — used for targeted invalidation
   *  (e.g. all of one user's cached recommendations). Maps to a Redis SCAN. */
  deleteByPrefix(prefix: string): Promise<void>;
  clear(): Promise<void>;
}

type Entry = { value: unknown; expiresAt: number };

/** LRU + TTL cache backed by a Map (insertion order = recency order). */
export class InMemoryLruStore implements CacheStore {
  private readonly map = new Map<string, Entry>();

  constructor(private readonly maxEntries = 5000) {}

  async get<T>(key: string): Promise<T | undefined> {
    const entry = this.map.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt <= Date.now()) {
      this.map.delete(key);
      return undefined;
    }
    // Touch: move to the end so it's the most-recently-used.
    this.map.delete(key);
    this.map.set(key, entry);
    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlMs: number): Promise<void> {
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, { value, expiresAt: Date.now() + ttlMs });
    if (this.map.size > this.maxEntries) {
      const oldest = this.map.keys().next().value;
      if (oldest !== undefined) this.map.delete(oldest);
    }
  }

  async getOrSet<T>(key: string, ttlMs: number, loader: () => Promise<T>): Promise<T> {
    const hit = await this.get<T>(key);
    if (hit !== undefined) return hit;
    const value = await loader();
    await this.set(key, value, ttlMs);
    return value;
  }

  async delete(key: string): Promise<void> {
    this.map.delete(key);
  }

  async deleteByPrefix(prefix: string): Promise<void> {
    for (const key of this.map.keys()) {
      if (key.startsWith(prefix)) this.map.delete(key);
    }
  }

  async clear(): Promise<void> {
    this.map.clear();
  }
}

export const cache: CacheStore = new InMemoryLruStore(
  Number(process.env["CACHE_MAX_ENTRIES"]) || 5000,
);

/** Cache key builders — centralized so reads and invalidation can't drift. */
export const cacheKeys = {
  filmDetail: (slug: string) => `film:detail:${slug}`,
  pickOfDay: (day: string) => `pickOfDay:${day}`,
  randomCount: (signature: string) => `random:count:${signature}`,
  /** Prefix covering all of one user's cached recommendations (any limit). */
  recommendationsPrefix: (userId: string) => `recs:${userId}:`,
  recommendations: (userId: string, limit: number) => `recs:${userId}:${limit}`,
} as const;
