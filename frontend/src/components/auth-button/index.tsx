"use client";

import { useSession } from "next-auth/react";
import type { AuthButtonProps } from "@/components/auth-button/types";
import { AuthButtonSkeleton } from "@/components/auth-button/auth-button-skeleton";
import { SignInLink } from "@/components/auth-button/sign-in-link";
import { InlineAccountList } from "@/components/auth-button/inline-account-list";
import { AccountMenu } from "@/components/auth-button/account-menu";

export function AuthButton({
  focusRingClassName = "focus-visible:ring-[#e8453c]",
  variant = "menu",
  onNavigate,
}: AuthButtonProps) {
  const { data: session, status } = useSession();
  const isInline = variant === "inline";

  if (status === "loading") {
    return <AuthButtonSkeleton isInline={isInline} />;
  }

  if (status === "unauthenticated") {
    return (
      <SignInLink
        isInline={isInline}
        focusRingClassName={focusRingClassName}
        onNavigate={onNavigate}
      />
    );
  }

  return isInline ? (
    <InlineAccountList
      user={session?.user}
      focusRingClassName={focusRingClassName}
      onNavigate={onNavigate}
    />
  ) : (
    <AccountMenu user={session?.user} focusRingClassName={focusRingClassName} />
  );
}
