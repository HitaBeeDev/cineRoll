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
 * asks for the account's own email typed out and, when the account has one,
 * re-verifies its current password on the server. Google-only accounts still
 * require the deliberate email acknowledgement because they have no local
 * credential to verify. Email confirmation is case-insensitive and trimmed.
 */
export function useDeleteAccount(email: string | null, hasPassword: boolean) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const expected = (email ?? "").trim().toLowerCase();
  const confirmed =
    expected.length > 0 &&
    confirmation.trim().toLowerCase() === expected &&
    (!hasPassword || currentPassword.length > 0);

  function openChange(nextOpen: boolean) {
    if (pending) return;
    // Cancelling clears the typed email, so re-opening never starts one click
    // away from deletion.
    if (!nextOpen) {
      setConfirmation("");
      setCurrentPassword("");
      setError(null);
    }
    setOpen(nextOpen);
  }

  async function confirmDelete() {
    if (pending || !confirmed) return;
    setPending(true);
    try {
      setError(null);
      await deleteAccountRequest(hasPassword ? currentPassword : undefined);
      window.sessionStorage.setItem(ACCOUNT_DELETED_TOAST_KEY, "1");
      await signOut({ callbackUrl: "/" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Please try again.");
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
    currentPassword,
    setCurrentPassword,
    error,
    confirmed,
    confirmDelete,
  };
}
