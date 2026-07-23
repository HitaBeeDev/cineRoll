"use client";

import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useDeleteAccount } from "./use-delete-account";

export function DeleteAccountCard() {
  const { open, setOpen, pending, confirmDelete } = useDeleteAccount();

  return (
    <section className="rounded-2xl border border-[#3a1f22] bg-[#130d10] px-6 py-6">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#e8453c]/30 bg-[#e8453c]/10 text-[#f0736a]">
          <Trash2 className="h-4 w-4" aria-hidden />
        </div>
        <div className="min-w-0">
          <h2 className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.2em] text-[#f0736a]">
            Danger Zone
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#a8a8b6]">
            Permanently delete your account, saved films, ratings, watch history,
            comments, and taste profile. Analytics are anonymized.
          </p>
        </div>
      </div>

      <Dialog open={open} onOpenChange={(nextOpen) => !pending && setOpen(nextOpen)}>
        <DialogTrigger asChild>
          <button
            type="button"
            className={cn(
              "mt-5 inline-flex h-11 items-center justify-center rounded-xl border border-[#e8453c]/40 px-4",
              "text-sm font-semibold text-[#f0736a] transition-colors hover:border-[#e8453c]/70 hover:bg-[#e8453c]/10",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]/50",
            )}
          >
            Delete My Account
          </button>
        </DialogTrigger>
        <DialogContent className="border-[#3a1f22] bg-[#100d12]">
          <DialogHeader>
            <DialogTitle>Delete your account?</DialogTitle>
            <DialogDescription>
              This cannot be undone. Your account data will be deleted, and
              analytics tied to your account will be anonymized.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild disabled={pending}>
              <button
                type="button"
                className="h-10 rounded-xl border border-white/10 px-4 text-sm font-medium text-[#c8c8d4] transition-colors hover:border-white/20 hover:text-[#F5F5F0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
              >
                Cancel
              </button>
            </DialogClose>
            <button
              type="button"
              disabled={pending}
              onClick={() => void confirmDelete()}
              className="h-10 rounded-xl bg-[#e8453c] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#f2554c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "Deleting..." : "Delete account"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
