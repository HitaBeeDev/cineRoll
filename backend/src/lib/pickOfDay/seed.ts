export function seededUnit(key: string): number {
  let hash = 2166136261;

  for (let i = 0; i < key.length; i++) {
    hash ^= key.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return ((hash >>> 0) % 1_000_000) / 1_000_000;
}
