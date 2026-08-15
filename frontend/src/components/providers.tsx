"use client";

import { SessionProvider } from "next-auth/react";
import { AccountDeletedToast } from "@/components/account-deleted-toast";
import { ToastProvider } from "@/components/ui/toast/toast-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>
        <AccountDeletedToast />
        {children}
      </ToastProvider>
    </SessionProvider>
  );
}
