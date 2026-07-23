"use client";

import { useEffect } from "react";
import { ACCOUNT_DELETED_TOAST_KEY } from "@/components/settings/account-deleted-toast-key";
import { useToast } from "@/components/ui/toast";

export function AccountDeletedToast() {
  const { toast } = useToast();

  useEffect(() => {
    if (window.sessionStorage.getItem(ACCOUNT_DELETED_TOAST_KEY) !== "1") return;

    window.sessionStorage.removeItem(ACCOUNT_DELETED_TOAST_KEY);
    toast({
      variant: "success",
      title: "Account deleted",
      description: "You have been signed out.",
    });
  }, [toast]);

  return null;
}
