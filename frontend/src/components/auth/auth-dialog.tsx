"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SignInOptions } from "@/components/auth/sign-in-options";

type AuthDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Where to return after auth — carries the user back to finish their action. */
  callbackUrl: string;
  title?: string | undefined;
  description?: string | undefined;
};

/**
 * Inline sign-in modal raised at the moment of intent (rate, comment …).
 * The action that triggered it is persisted separately and replayed on return,
 * so closing the loop doesn't make the user redo their input.
 */
export function AuthDialog({
  open,
  onOpenChange,
  callbackUrl,
  title = "Sign in to continue",
  description = "Your action is saved — finish signing in and we'll pick up right where you left off.",
}: AuthDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm border-[#1e1e2a] bg-[#09090f]">
        <DialogHeader>
          <DialogTitle className="font-[family-name:var(--font-display)] text-2xl font-bold text-[#F5F5F0]">
            {title}
          </DialogTitle>
          <DialogDescription className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.18em] text-[#888899]">
            {description}
          </DialogDescription>
        </DialogHeader>
        <SignInOptions callbackUrl={callbackUrl} />
      </DialogContent>
    </Dialog>
  );
}
