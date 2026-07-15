export function getNameInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();
}

export function getNameHue(name: string): number {
  let hash = 0;
  for (const character of name) {
    hash = character.charCodeAt(0) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}
