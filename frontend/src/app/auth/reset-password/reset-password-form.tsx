"use client";

import { useSearchParams } from "next/navigation";
import { InvalidResetLink } from "./invalid-reset-link";
import { ResetPasswordFields } from "./reset-password-fields";
import { ResetPasswordSuccess } from "./reset-password-success";
import { useResetPassword } from "./use-reset-password";

export function ResetPasswordForm() {
  const token = useSearchParams().get("token") ?? "";
  const resetPassword = useResetPassword(token);

  if (!token) {
    return <InvalidResetLink />;
  }

  if (resetPassword.done) {
    return <ResetPasswordSuccess />;
  }

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold leading-tight sm:text-4xl">
        Set a new <span className="text-[#e8453c]">password</span>
      </h1>
      <p className="mt-3 text-sm leading-6 text-[#c8c8d4]">
        Choose a new password for your CineRoll account.
      </p>

      <ResetPasswordFields
        password={resetPassword.password}
        confirm={resetPassword.confirm}
        error={resetPassword.error}
        isLoading={resetPassword.isLoading}
        onPasswordChange={resetPassword.setPassword}
        onConfirmChange={resetPassword.setConfirm}
        onSubmit={resetPassword.submit}
      />
    </div>
  );
}
