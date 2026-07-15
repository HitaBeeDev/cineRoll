export function calculateJaccardDistance(
  left: Set<string>,
  right: Set<string>,
): number {
  if (left.size === 0 && right.size === 0) return 0;

  let intersection = 0;
  left.forEach((value) => {
    if (right.has(value)) intersection += 1;
  });
  const union = left.size + right.size - intersection;
  return union === 0 ? 0 : 1 - intersection / union;
}
