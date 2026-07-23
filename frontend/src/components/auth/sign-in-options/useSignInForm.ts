"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import type { Mode } from "@/components/auth/sign-in-options/types";
import { registerAccount } from "@/components/auth/sign-in-options/register-account";

/**
 * Owns the sign-in / create-account flow: mode toggle, field state, validation,
 * credentials + Google sign-in, and the register call. On success it navigates
 * to a sanitized (relative-only) callback URL to avoid open redirects.
 */
export function useSignInForm(callbackUrl: string) {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only relative paths, to avoid an open-redirect.
  const safeCallbackUrl = callbackUrl.startsWith("/") ? callbackUrl : "/";
  const busy = isLoading || isGoogleLoading;

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setConfirm("");
  }

  async function completeSignIn() {
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) {
      setError("Incorrect email or password.");
      return;
    }
    window.location.href = safeCallbackUrl;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError(null);

    if (mode === "signup" && password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setIsLoading(true);
    try {
      if (mode === "signup") {
        const result = await registerAccount(email, password);
        if (!result.ok) {
          setError(result.error);
          return;
        }
      }
      await completeSignIn();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function googleSignIn() {
    setIsGoogleLoading(true);
    await signIn("google", { callbackUrl: safeCallbackUrl });
  }

  return {
    mode,
    email,
    password,
    confirm,
    error,
    isLoading,
    busy,
    setEmail,
    setPassword,
    setConfirm,
    switchMode,
    submit,
    googleSignIn,
  };
}
