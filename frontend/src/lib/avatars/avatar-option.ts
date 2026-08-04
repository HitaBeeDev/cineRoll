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
