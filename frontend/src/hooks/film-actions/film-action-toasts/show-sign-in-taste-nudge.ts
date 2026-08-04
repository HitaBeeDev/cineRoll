import type { Toast } from "../types";

const NUDGE_TOAST_DURATION = 10_000;

export function showSignInTasteNudge(toast: Toast): void {
  toast({
    title: "Sign in to save your taste",
    description: "Create a profile to tune your recommendations.",
    action: { label: "Sign in", href: "/auth/signin" },
    duration: NUDGE_TOAST_DURATION,
  });
}
