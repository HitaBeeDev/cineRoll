"use client";

import { useState } from "react";
import { resetPassword } from "./reset-password-api";
import { validateResetPasswordFields } from "./reset-password-validation";

export function useResetPassword(token: string) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit() {
    if (isLoading) return;

    setError(null);

    const validationError = validateResetPasswordFields({ password, confirm });
    if (validationError !== null) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    const result = await resetPassword({ token, password });
    setIsLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setDone(true);
  }

  return {
    password,
    confirm,
    isLoading,
    error,
    done,
    setPassword,
    setConfirm,
    submit,
  };
}
