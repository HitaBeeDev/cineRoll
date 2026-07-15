import type { CastMember } from "@cineroll/types";

export function normalizeCast(rawCast: unknown[]): CastMember[] {
  return rawCast.map(normalizeCastMember);
}

function normalizeCastMember(item: unknown): CastMember {
  if (typeof item === "string") {
    return { name: item, character: "", photoUrl: null };
  }

  const member = item as Record<string, unknown>;
  return {
    name: (member.name as string) ?? "",
    character: (member.character as string) ?? "",
    photoUrl: (member.photoUrl ?? member.profileUrl ?? null) as string | null,
  };
}
