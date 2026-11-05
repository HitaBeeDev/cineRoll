/**
 * `count` items from `items`, the same all day and different the next (UTC
 * date as the seed). Lets a cached page say "tonight's picks" honestly: the
 * pool is fixed by the data, the choice from it turns over daily.
 */
export function pickDaily<T>(items: T[], count: number, date: Date): T[] {
  let seed = 0;
  for (const char of date.toISOString().slice(0, 10)) seed = (seed * 31 + char.charCodeAt(0)) >>> 0;
  const random = () => {
    // mulberry32 — small, fast, good enough to shuffle a list.
    seed = (seed + 0x6d2b79f5) >>> 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy.slice(0, count);
}
