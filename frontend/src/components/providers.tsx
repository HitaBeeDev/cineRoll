"use client";

import { SessionProvider } from "next-auth/react";
import { AccountDeletedToast } from "@/components/account-deleted-toast";
import { ToastProvider } from "@/components/ui/toast";
import { ThemeProvider } from "@/components/theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <ToastProvider>
          <AccountDeletedToast />
          {children}
        </ToastProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
