"use client";

import { useState } from "react";
import { requestPasswordReset } from "./forgot-password-api";

export function useForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit() {
    if (isLoading) return;
    setIsLoading(true);
    await requestPasswordReset(email);
    setIsLoading(false);
    setSent(true);
  }

  return { email, isLoading, sent, setEmail, submit };
}
