"use client";

import { Trash2 } from "lucide-react";
import { Dialog } from "@/components/ui/dialog/dialog";
import { DialogClose } from "@/components/ui/dialog/dialog-close";
import { DialogContent } from "@/components/ui/dialog/dialog-content";
import { DialogDescription } from "@/components/ui/dialog/dialog-description";
import { DialogFooter } from "@/components/ui/dialog/dialog-footer";
import { DialogHeader } from "@/components/ui/dialog/dialog-header";
import { DialogTitle } from "@/components/ui/dialog/dialog-title";
import { DialogTrigger } from "@/components/ui/dialog/dialog-trigger";
import { cn } from "@/lib/utils/cn";
import { SectionHeading } from "./section-heading";
import { useDeleteAccount } from "./use-delete-account";

export function DeleteAccountCard({ email }: { email: string | null }) {
  const { open, openChange, pending, confirmation, setConfirmation, confirmed, confirmDelete } =
    useDeleteAccount(email);

  return (
    <section className="rounded-2xl border border-[#2a1b1f] bg-[#0f0c0f] px-6 py-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#3a2226] bg-[#170f12] text-accent-soft">
            <Trash2 className="h-4 w-4" aria-hidden />
          </div>
          <div className="min-w-0">
            <SectionHeading eyebrow="Danger zone" title="Delete your account" tone="danger" />
            <p className="mt-2 max-w-xl text-sm leading-6 text-fg-muted">
              Permanently deletes your account, saved films, ratings, watch history, comments, and
              taste profile. Analytics are anonymized. This cannot be undone.
            </p>
          </div>
        </div>

        <Dialog open={open} onOpenChange={openChange}>
          <DialogTrigger asChild>
            {/* Neutral until you reach for it. Accent red is the brand colour
                here — it fills the primary submit on this same page — so
                spending it on a resting destructive button teaches the eye to
                read red as "CineRoll", which is exactly the wrong lesson at the
                moment the warning has to land. */}
            <button
              type="button"
              className={cn(
                "inline-flex h-11 shrink-0 items-center justify-center rounded-xl px-4",
                "border border-edge-strong text-sm font-semibold text-fg-dim",
                "transition-colors hover:border-accent/60 hover:bg-accent/10 hover:text-accent-soft",
                "focus-visible:outline-none focus-visible:border-accent/60 focus-visible:text-accent-soft",
                "focus-visible:ring-2 focus-visible:ring-accent/40",
              )}
            >
              Delete my account
            </button>
          </DialogTrigger>

          <DialogContent className="border-[#3a1f22] bg-[#100d12]">
            <DialogHeader>
              <DialogTitle>Delete your account?</DialogTitle>
              <DialogDescription>
                This cannot be undone. Your account data will be deleted, and analytics tied to your
                account will be anonymized.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <label
                htmlFor="delete-confirmation"
                className="block text-sm text-fg-muted"
              >
                Type <span className="font-medium text-fg-hi">{email}</span> to confirm.
              </label>
              <input
                id="delete-confirmation"
                type="email"
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                disabled={pending}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                aria-describedby="delete-confirmation-hint"
                className={cn(
                  "h-11 w-full rounded-xl border border-edge bg-ink-950 px-3 text-sm text-fg-hi",
                  "placeholder:text-fg-faint transition-colors",
                  "focus:outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/30",
                  "disabled:cursor-not-allowed disabled:opacity-60",
                )}
              />
              <p id="delete-confirmation-hint" className="text-xs text-fg-faint">
                We ask for this so a stray click can&apos;t delete an account.
              </p>
            </div>

            <DialogFooter>
              <DialogClose asChild disabled={pending}>
                <button
                  type="button"
                  className="h-10 rounded-xl border border-edge px-4 text-sm font-medium text-fg-dim transition-colors hover:border-edge-strong hover:text-fg-hi focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                >
                  Cancel
                </button>
              </DialogClose>
              <button
                type="button"
                disabled={pending || !confirmed}
                onClick={() => void confirmDelete()}
                className="h-10 rounded-xl bg-accent px-4 text-sm font-semibold text-white transition-colors hover:bg-[#f2554c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-40"
              >
                {pending ? "Deleting…" : "Delete account"}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
