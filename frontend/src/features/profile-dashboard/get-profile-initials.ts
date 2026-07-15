export function getProfileInitials(
  name?: string | null,
  email?: string | null,
): string {
  const source = (name ?? email ?? "").trim();
  if (!source) return "?";

  const words = source.split(/\s+/).filter(Boolean);
  if (words.length < 2) return source.slice(0, 2).toUpperCase();

  return `${words[0]?.[0] ?? ""}${words[1]?.[0] ?? ""}`.toUpperCase();
}
