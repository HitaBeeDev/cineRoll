export function getTitleSize(title: string): number {
  if (title.length > 42) return 60;
  if (title.length > 30) return 74;
  if (title.length > 20) return 88;
  return 104;
}
