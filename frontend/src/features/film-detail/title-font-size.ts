export function getTitleFontSize(title: string): string {
  const length = title.length;
  if (length <= 20) return "clamp(2.75rem, 6vw, 6rem)";
  if (length <= 35) return "clamp(2.5rem, 5.2vw, 5rem)";
  if (length <= 50) return "clamp(2.25rem, 4.4vw, 4.25rem)";
  if (length <= 68) return "clamp(2rem, 3.6vw, 3.5rem)";
  return "clamp(1.75rem, 3vw, 2.9rem)";
}
