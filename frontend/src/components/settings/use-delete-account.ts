"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { deleteAccount as deleteAccountRequest } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { ACCOUNT_DELETED_TOAST_KEY } from "./account-deleted-toast-key";

/**
 * Drives the delete-account confirmation dialog. On success it flags a one-time
 * toast and signs the user out; on failure it surfaces an error and stays open.
 */
export function useDeleteAccount() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function confirmDelete() {
    if (pending) return;
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

  return { open, setOpen, pending, confirmDelete };
}
