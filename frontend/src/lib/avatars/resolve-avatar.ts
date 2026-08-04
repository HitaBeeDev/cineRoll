import { AVATAR_OPTIONS } from "./avatar-options";
import type { AvatarOption } from "./avatar-option";

/** The art option for an id, or null when the id isn't a chosen avatar
 *  (null / empty / legacy id) — callers render an initials monogram instead. */
export function resolveAvatar(image?: string | null): AvatarOption | null {
  if (!image) return null;
  return AVATAR_OPTIONS.find((option) => option.id === image) ?? null;
}
