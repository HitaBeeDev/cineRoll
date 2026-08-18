"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { deleteAccount as deleteAccountRequest } from "@/lib/api";
import { useToast } from "@/components/ui/toast/use-toast";
import { ACCOUNT_DELETED_TOAST_KEY } from "./account-deleted-toast-key";

/**
 * Drives the delete-account confirmation dialog. On success it flags a one-time
 * toast and signs the user out; on failure it surfaces an error and stays open.
 *
 * Deletion is irreversible and cascades across every table the account owns, so
 * a single click on an open session is too cheap a gesture for it. The dialog
 * asks for the account's own email typed out: it costs a deliberate five
 * seconds, it cannot be produced by a mis-click, and — unlike re-entering a
 * password — it works for Google-only accounts, which have no password to ask
 * for. `confirmation` is compared case-insensitively and trimmed, because
 * neither casing nor a trailing space says anything about intent.
 */
export function useDeleteAccount(email: string | null) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [confirmation, setConfirmation] = useState("");

  const expected = (email ?? "").trim().toLowerCase();
  const confirmed = expected.length > 0 && confirmation.trim().toLowerCase() === expected;

  function openChange(nextOpen: boolean) {
    if (pending) return;
    // Cancelling clears the typed email, so re-opening never starts one click
    // away from deletion.
    if (!nextOpen) setConfirmation("");
    setOpen(nextOpen);
  }

  async function confirmDelete() {
    if (pending || !confirmed) return;
    setPending(true);
    try {
      await deleteAccountRequest();
      window.sessionStorage.setItem(ACCOUNT_DELETED_TOAST_KEY, "1");
      await signOut({ callbackUrl: "/" });
    } catch {
      toast({
        variant: "error",
        title: "Account not deleted",
        description: "Please try again.",
      });
      setPending(false);
    }
  }

  return {
    open,
    openChange,
    pending,
    confirmation,
    setConfirmation,
    confirmed,
    confirmDelete,
  };
}
