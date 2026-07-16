// Deterministic "randomness": FNV-1a hash of the key, folded to a float in
// [0, 1). The same key ("2026-07-16:<filmId>") always yields the same value on
// any machine — which is the whole point: the daily pick must not depend on
// Math.random(), process, or instance. The constants are FNV-1a's standard
// 32-bit offset basis and prime.
export function seededUnit(key: string): number {
  let hash = 2166136261;

  for (let i = 0; i < key.length; i++) {
    hash ^= key.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return ((hash >>> 0) % 1_000_000) / 1_000_000;
}
