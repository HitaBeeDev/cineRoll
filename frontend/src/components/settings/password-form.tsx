"use client";

import { PasswordInput } from "@/components/auth/password-input";
import { cn } from "@/lib/utils/cn";
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
    success,
    pending,
    issue,
    passwordsMatch,
    canSubmit,
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
      className="mt-5 flex flex-col gap-4"
    >
      <div className={`grid items-start gap-4 ${hasPassword ? "lg:grid-cols-3" : "md:grid-cols-2"}`}>
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
          aria-describedby="new-password-requirements"
          aria-invalid={newPassword.length > 0 && issue !== null}
        />
        <div id="new-password-requirements" className="space-y-1 text-xs" aria-live="polite">
          <p className={newPassword.length >= 8 ? "text-affirm-hi" : "text-fg-muted"}>
            {newPassword.length >= 8 ? "✓" : "○"} At least 8 characters
          </p>
          <p className={/[a-zA-Z]/.test(newPassword) && /[0-9]/.test(newPassword) ? "text-affirm-hi" : "text-fg-muted"}>
            {/[a-zA-Z]/.test(newPassword) && /[0-9]/.test(newPassword) ? "✓" : "○"} At least one letter and one number
          </p>
        </div>
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
          aria-invalid={confirmPassword.length > 0 && !passwordsMatch}
          {...(confirmPassword.length > 0
            ? { "aria-describedby": "password-match-status" }
            : {})}
        />
        {confirmPassword.length > 0 && (
          <p id="password-match-status" className={`text-xs ${passwordsMatch ? "text-affirm-hi" : "text-caution"}`} aria-live="polite">
            {passwordsMatch ? "✓ Passwords match" : "Passwords do not match yet."}
          </p>
        )}
        </div>
      </div>

      {error && <p role="alert" className="rounded-lg border border-accent/25 bg-accent/10 px-3 py-2 text-sm text-caution">{error}</p>}
      {success && <p role="status" className="rounded-lg border border-affirm/25 bg-affirm/10 px-3 py-2 text-sm text-affirm-hi">{success}</p>}

      <div className="flex items-center justify-end border-t border-white/[0.06] pt-4">
        <button
          type="submit"
          disabled={!canSubmit}
          className={cn(
            // Accent, like every other primary submit in the app. It was gold,
            // which is the accolade colour and has no business on a routine
            // form action.
            "h-11 rounded-xl bg-accent px-5 text-sm font-semibold text-white",
            "transition-colors hover:bg-[#d5342b] disabled:cursor-not-allowed disabled:opacity-60",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
          )}
        >
          {pending ? "Saving…" : hasPassword ? "Change password" : "Set password"}
        </button>
      </div>
    </form>
  );
}
