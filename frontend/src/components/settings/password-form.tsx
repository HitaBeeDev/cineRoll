"use client";

import { PasswordInput } from "@/components/auth/password-input";
import { cn } from "@/lib/utils";
import { usePasswordForm } from "./use-password-form";

/**
 * Changes (or, for OAuth-only accounts, sets for the first time) the signed-in
 * user's password. `hasPassword` decides whether the current-password field is
 * shown — an account with no hash yet has nothing to verify.
 */
export function PasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const {
    currentPassword,
    newPassword,
    confirmPassword,
    error,
    pending,
    setCurrentPassword,
    setNewPassword,
    setConfirmPassword,
    submit,
  } = usePasswordForm(hasPassword);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
      className="mt-4 flex flex-1 flex-col gap-4"
    >
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
        <p className="text-xs text-[#7f7f92]">Use at least 8 characters.</p>
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

      {/* Actions pinned to the card bottom so the (stretched) card never shows a
          dead gap — reads as an intentional form footer. */}
      <div className="mt-auto flex items-center justify-end border-t border-white/[0.06] pt-4">
        <button
          type="submit"
          disabled={pending}
          className={cn(
            "h-11 rounded-xl bg-[#d4af37] px-5 text-sm font-semibold text-[#0b0b12]",
            "transition-colors hover:bg-[#e0bd4d] disabled:cursor-not-allowed disabled:opacity-60",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]/40",
          )}
        >
          {pending ? "Saving…" : hasPassword ? "Change password" : "Set password"}
        </button>
      </div>
    </form>
  );
}
