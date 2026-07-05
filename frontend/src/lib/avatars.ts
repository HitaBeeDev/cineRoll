// Curated avatar set. We store only a short id (e.g. "art:lorelei-2") on
// User.image — no uploads, no storage, no moderation. Each id maps to a static,
// same-origin SVG in /public/avatars generated once from DiceBear (offline at
// render time). A user who hasn't picked one falls back to an initials monogram.

export type AvatarOption = {
  id: string;
  label: string;
  /** same-origin SVG path under /public */
  file: string;
};

export const AVATAR_OPTIONS: readonly AvatarOption[] = [
  { id: "art:adventurer-neutral-0", label: "Adventurer 1", file: "/avatars/adventurer-neutral-0.svg" },
  { id: "art:lorelei-0", label: "Lorelei 1", file: "/avatars/lorelei-0.svg" },
  { id: "art:big-ears-neutral-0", label: "Big Ears 1", file: "/avatars/big-ears-neutral-0.svg" },
  { id: "art:pixel-art-neutral-0", label: "Pixel 1", file: "/avatars/pixel-art-neutral-0.svg" },
  { id: "art:bottts-0", label: "Bottts 1", file: "/avatars/bottts-0.svg" },
  { id: "art:bottts-neutral-0", label: "Bot 1", file: "/avatars/bottts-neutral-0.svg" },
  { id: "art:adventurer-0", label: "Explorer 1", file: "/avatars/adventurer-0.svg" },
  { id: "art:thumbs-0", label: "Thumb 1", file: "/avatars/thumbs-0.svg" },
  { id: "art:adventurer-neutral-1", label: "Adventurer 2", file: "/avatars/adventurer-neutral-1.svg" },
  { id: "art:lorelei-1", label: "Lorelei 2", file: "/avatars/lorelei-1.svg" },
  { id: "art:big-ears-neutral-1", label: "Big Ears 2", file: "/avatars/big-ears-neutral-1.svg" },
  { id: "art:pixel-art-neutral-1", label: "Pixel 2", file: "/avatars/pixel-art-neutral-1.svg" },
  { id: "art:bottts-1", label: "Bottts 2", file: "/avatars/bottts-1.svg" },
  { id: "art:bottts-neutral-1", label: "Bot 2", file: "/avatars/bottts-neutral-1.svg" },
  { id: "art:adventurer-1", label: "Explorer 2", file: "/avatars/adventurer-1.svg" },
  { id: "art:thumbs-1", label: "Thumb 2", file: "/avatars/thumbs-1.svg" },
  { id: "art:adventurer-neutral-2", label: "Adventurer 3", file: "/avatars/adventurer-neutral-2.svg" },
  { id: "art:lorelei-2", label: "Lorelei 3", file: "/avatars/lorelei-2.svg" },
  { id: "art:big-ears-neutral-2", label: "Big Ears 3", file: "/avatars/big-ears-neutral-2.svg" },
  { id: "art:pixel-art-neutral-2", label: "Pixel 3", file: "/avatars/pixel-art-neutral-2.svg" },
  { id: "art:bottts-2", label: "Bottts 3", file: "/avatars/bottts-2.svg" },
  { id: "art:bottts-neutral-2", label: "Bot 3", file: "/avatars/bottts-neutral-2.svg" },
  { id: "art:adventurer-2", label: "Explorer 3", file: "/avatars/adventurer-2.svg" },
  { id: "art:thumbs-2", label: "Thumb 3", file: "/avatars/thumbs-2.svg" },
  { id: "art:adventurer-neutral-3", label: "Adventurer 4", file: "/avatars/adventurer-neutral-3.svg" },
  { id: "art:lorelei-3", label: "Lorelei 4", file: "/avatars/lorelei-3.svg" },
  { id: "art:big-ears-neutral-3", label: "Big Ears 4", file: "/avatars/big-ears-neutral-3.svg" },
  { id: "art:pixel-art-neutral-3", label: "Pixel 4", file: "/avatars/pixel-art-neutral-3.svg" },
  { id: "art:bottts-3", label: "Bottts 4", file: "/avatars/bottts-3.svg" },
  { id: "art:bottts-neutral-3", label: "Bot 4", file: "/avatars/bottts-neutral-3.svg" },
  { id: "art:adventurer-3", label: "Explorer 4", file: "/avatars/adventurer-3.svg" },
  { id: "art:thumbs-3", label: "Thumb 4", file: "/avatars/thumbs-3.svg" },
  { id: "art:adventurer-neutral-4", label: "Adventurer 5", file: "/avatars/adventurer-neutral-4.svg" },
  { id: "art:lorelei-4", label: "Lorelei 5", file: "/avatars/lorelei-4.svg" },
  { id: "art:big-ears-neutral-4", label: "Big Ears 5", file: "/avatars/big-ears-neutral-4.svg" },
  { id: "art:pixel-art-neutral-4", label: "Pixel 5", file: "/avatars/pixel-art-neutral-4.svg" },
  { id: "art:bottts-4", label: "Bottts 5", file: "/avatars/bottts-4.svg" },
  { id: "art:bottts-neutral-4", label: "Bot 5", file: "/avatars/bottts-neutral-4.svg" },
  { id: "art:adventurer-4", label: "Explorer 5", file: "/avatars/adventurer-4.svg" },
  { id: "art:thumbs-4", label: "Thumb 5", file: "/avatars/thumbs-4.svg" },
  { id: "art:adventurer-neutral-5", label: "Adventurer 6", file: "/avatars/adventurer-neutral-5.svg" },
  { id: "art:lorelei-5", label: "Lorelei 6", file: "/avatars/lorelei-5.svg" },
  { id: "art:big-ears-neutral-5", label: "Big Ears 6", file: "/avatars/big-ears-neutral-5.svg" },
  { id: "art:pixel-art-neutral-5", label: "Pixel 6", file: "/avatars/pixel-art-neutral-5.svg" },
  { id: "art:bottts-5", label: "Bottts 6", file: "/avatars/bottts-5.svg" },
  { id: "art:bottts-neutral-5", label: "Bot 6", file: "/avatars/bottts-neutral-5.svg" },
  { id: "art:adventurer-5", label: "Explorer 6", file: "/avatars/adventurer-5.svg" },
  { id: "art:thumbs-5", label: "Thumb 6", file: "/avatars/thumbs-5.svg" },
] as const;

/** How many to show before the "View more" button in the picker. */
export const AVATAR_PREVIEW_COUNT = 9;

export const DEFAULT_AVATAR: AvatarOption = AVATAR_OPTIONS[0]!;

/** The art option for an id, or null when the id isn't a chosen avatar
 *  (null / empty / legacy id) — callers render an initials monogram instead. */
export function resolveAvatar(image?: string | null): AvatarOption | null {
  if (!image) return null;
  return AVATAR_OPTIONS.find((option) => option.id === image) ?? null;
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
