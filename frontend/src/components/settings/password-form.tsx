"use client";

import { useState } from "react";
import { PasswordInput } from "@/components/auth/password-input";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

/**
 * Changes (or, for OAuth-only accounts, sets for the first time) the signed-in
 * user's password. `hasPassword` decides whether the current-password field is
 * shown — an account with no hash yet has nothing to verify.
 */
export function PasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("New passwords don’t match.");
      return;
    }

    setPending(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(hasPassword ? { currentPassword } : {}),
          newPassword,
        }),
      });
      const data: { error?: string } = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast({
        variant: "success",
        title: hasPassword ? "Password changed" : "Password set",
      });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-4">
      {hasPassword && (
        <div className="space-y-1.5">
          <label
            htmlFor="current-password"
            className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest text-[#888899]"
          >
            Current password
          </label>
          <PasswordInput
            id="current-password"
            value={currentPassword}
            onChange={setCurrentPassword}
            autoComplete="current-password"
            required
          />
        </div>
      )}

      <div className="space-y-1.5">
        <label
          htmlFor="new-password"
          className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest text-[#888899]"
        >
          New password
        </label>
        <PasswordInput
          id="new-password"
          value={newPassword}
          onChange={setNewPassword}
          autoComplete="new-password"
          required
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="confirm-password"
          className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest text-[#888899]"
        >
          Confirm new password
        </label>
        <PasswordInput
          id="confirm-password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          autoComplete="new-password"
          required
        />
      </div>

      {error && <p className="text-sm text-[#f0736a]">{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className={cn(
          "h-11 rounded-xl bg-[#e8453c] px-5 text-sm font-semibold text-white",
          "transition-colors hover:bg-[#d13c34] disabled:cursor-not-allowed disabled:opacity-60",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]/40",
        )}
      >
        {pending
          ? "Saving…"
          : hasPassword
            ? "Change password"
            : "Set password"}
      </button>
    </form>
  );
}
