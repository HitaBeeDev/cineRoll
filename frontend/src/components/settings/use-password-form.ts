"use client";

import { useState } from "react";
import { changePassword } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { validatePasswordForm } from "./password-form-validation";

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
  const [pending, setPending] = useState(false);

  async function submit() {
    if (pending) return;
    setError(null);

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
    pending,
    setCurrentPassword,
    setNewPassword,
    setConfirmPassword,
    submit,
  };
}
