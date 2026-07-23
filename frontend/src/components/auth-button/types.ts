export type AuthUser = {
  name?: string | null;
  image?: string | null;
  email?: string | null;
};

export type AuthButtonProps = {
  focusRingClassName?: string;
  // "menu" (default) → compact avatar + dropdown, for the desktop header.
  // "inline" → account links rendered directly in a list, for the mobile menu
  // (a dropdown anchored to the bottom of a full-screen sheet opens off-screen).
  variant?: "menu" | "inline";
  // Called when a link/sign-out is tapped, so the host can close the mobile menu.
  onNavigate?: () => void;
};
