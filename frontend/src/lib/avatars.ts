// Curated avatar set. We store only a short id (e.g. "color:ember", "glyph:reel")
// on User.image — no uploads, no storage, no moderation. Rendering maps the id
// to an on-brand dark disc: a colored initials monogram or a film-motif glyph.

export type AvatarKind = "color" | "glyph";

export type AvatarOption = {
  id: string;
  kind: AvatarKind;
  label: string;
  accent: string;
};

export const AVATAR_OPTIONS: readonly AvatarOption[] = [
  { id: "color:ember", kind: "color", label: "Ember monogram", accent: "#e8453c" },
  { id: "color:amber", kind: "color", label: "Amber monogram", accent: "#e0a458" },
  { id: "color:jade", kind: "color", label: "Jade monogram", accent: "#46b361" },
  { id: "color:azure", kind: "color", label: "Azure monogram", accent: "#4b9fea" },
  { id: "color:violet", kind: "color", label: "Violet monogram", accent: "#9a7cf0" },
  { id: "glyph:reel", kind: "glyph", label: "Film reel", accent: "#e8453c" },
  { id: "glyph:clap", kind: "glyph", label: "Clapperboard", accent: "#e0a458" },
  { id: "glyph:ticket", kind: "glyph", label: "Ticket", accent: "#46b361" },
  { id: "glyph:star", kind: "glyph", label: "Star", accent: "#9a7cf0" },
] as const;

export const DEFAULT_AVATAR: AvatarOption = AVATAR_OPTIONS[0]!;

export function resolveAvatar(image?: string | null): AvatarOption {
  return AVATAR_OPTIONS.find((option) => option.id === image) ?? DEFAULT_AVATAR;
}

export function isValidAvatarId(id: string): boolean {
  return AVATAR_OPTIONS.some((option) => option.id === id);
}

export function avatarInitials(name?: string | null, email?: string | null): string {
  const source = (name ?? email ?? "").trim();
  if (!source) return "?";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}
