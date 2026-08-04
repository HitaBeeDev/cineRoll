import { AVATAR_OPTIONS } from "./avatar-options";

export function isValidAvatarId(id: string): boolean {
  return AVATAR_OPTIONS.some((option) => option.id === id);
}
