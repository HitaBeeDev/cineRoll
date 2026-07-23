import Link from "next/link";
import { cn } from "@/lib/utils";
import { PasswordInput } from "@/components/auth/password-input";
import type { Mode } from "@/components/auth/sign-in-options/types";
import { inputClass, labelClass } from "@/components/auth/sign-in-options/styles";

interface CredentialsFormProps {
  mode: Mode;
  email: string;
  password: string;
  confirm: string;
  error: string | null;
  isLoading: boolean;
  busy: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

function submitLabel(mode: Mode, isLoading: boolean): string {
  if (isLoading) return mode === "signup" ? "Creating account…" : "Signing in…";
  return mode === "signup" ? "Create account" : "Sign in";
}

export function CredentialsForm({
  mode,
  email,
  password,
  confirm,
  error,
  isLoading,
  busy,
  onEmailChange,
  onPasswordChange,
  onConfirmChange,
  onSubmit,
}: CredentialsFormProps) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <label htmlFor="signin-email" className={labelClass}>
          Email address
        </label>
        <input
          id="signin-email"
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          required
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="signin-password" className={labelClass}>
          Password
        </label>
        <PasswordInput
          id="signin-password"
          value={password}
          onChange={onPasswordChange}
          placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          required
        />
        {mode === "signin" && (
          <Link
            href="/auth/forgot-password"
            className="self-end text-xs text-[#8f8fa0] underline-offset-2 transition-colors hover:text-[#c8c8d4] hover:underline"
          >
            Forgot password?
          </Link>
        )}
      </div>

      {mode === "signup" && (
        <div className="flex flex-col gap-2">
          <label htmlFor="signin-confirm" className={labelClass}>
            Confirm password
          </label>
          <PasswordInput
            id="signin-confirm"
            value={confirm}
            onChange={onConfirmChange}
            placeholder="Re-enter your password"
            autoComplete="new-password"
            required
          />
        </div>
      )}

      {error !== null && <p className="text-xs text-[#ff7068]">{error}</p>}

      <button
        type="submit"
        disabled={busy}
        className={cn(
          "h-12 w-full rounded-xl bg-[#e8453c]",
          "text-sm font-semibold text-[#F5F5F0]",
          "shadow-[0_10px_28px_rgba(232,69,60,0.16)] transition hover:bg-[#f2554c]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
          "disabled:cursor-not-allowed disabled:bg-[#8f302b] disabled:text-[#c9a1a0] disabled:shadow-none",
        )}
      >
        {submitLabel(mode, isLoading)}
      </button>
    </form>
  );
}
