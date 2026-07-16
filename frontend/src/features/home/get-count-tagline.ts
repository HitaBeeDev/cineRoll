export function getCountTagline(count: number | null): string {
  if (count === null) return "films in the reel";
  if (count === 1) return "film. You know exactly what you want.";
  if (count <= 5) return "films. Very specific taste.";
  if (count <= 20) return "films. A good shortlist.";
  if (count <= 100) return "films. Ready to roll?";
  return "films. Plenty to choose from.";
}
