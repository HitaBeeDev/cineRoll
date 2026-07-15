export function getPersonBioPreview(
  bio: string,
  maxLength: number,
): string {
  if (bio.length <= maxLength) return bio;
  return `${bio.slice(0, maxLength).trim()}…`;
}
