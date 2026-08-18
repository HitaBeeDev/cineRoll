"use client";

import { useState } from "react";
import { changePassword } from "@/lib/api";
import { useToast } from "@/components/ui/toast/use-toast";
import { validatePasswordForm } from "./password-form-validation";
import { passwordIssue } from "@/lib/password/password-issue";

/**
 * State + submission for the change/set-password form. `hasPassword` is false
 * for OAuth-only accounts, which set a password for the first time (no current
 * password to send or verify).
 */
export function usePasswordForm(hasPassword: boolean) {
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const issue = passwordIssue(newPassword);
  const passwordsMatch = confirmPassword.length > 0 && newPassword === confirmPassword;
  const canSubmit =
    !pending && issue === null && passwordsMatch && (!hasPassword || currentPassword.length > 0);

  function edit(setter: (value: string) => void, value: string) {
    setError(null);
    setSuccess(null);
    setter(value);
  }

  async function submit() {
    if (pending) return;
    setError(null);
    setSuccess(null);

    const validationError = validatePasswordForm({ newPassword, confirmPassword });
    if (validationError !== null) {
      setError(validationError);
      return;
    }

    setPending(true);
    try {
      await changePassword({
        ...(hasPassword ? { currentPassword } : {}),
        newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess(hasPassword ? "Your password has been changed." : "Your password is ready to use.");
      toast({
        variant: "success",
        title: hasPassword ? "Password changed" : "Password set",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return {
    currentPassword,
    newPassword,
    confirmPassword,
    error,
    success,
    pending,
    issue,
    passwordsMatch,
    canSubmit,
    setCurrentPassword: (value: string) => edit(setCurrentPassword, value),
    setNewPassword: (value: string) => edit(setNewPassword, value),
    setConfirmPassword: (value: string) => edit(setConfirmPassword, value),
    submit,
  };
}
