"use client";

import { useSignInForm } from "@/components/auth/sign-in-options/useSignInForm";
import { GoogleSignInButton } from "@/components/auth/sign-in-options/google-sign-in-button";
import { AuthDivider } from "@/components/auth/sign-in-options/auth-divider";
import { CredentialsForm } from "@/components/auth/sign-in-options/credentials-form";
import { ModeSwitch } from "@/components/auth/sign-in-options/mode-switch";

type SignInOptionsProps = {
  /**
   * Relative path to return to after auth. Honoured by both Google (redirect)
   * and credentials sign-in, so flows like "rate → sign in → land back on the
   * film" resume where they started.
   */
  callbackUrl: string;
};

/** Shared sign-in / create-account controls (Google + email & password). Used
 *  by the full sign-in page and the inline auth modal so both stay in sync. */
export function SignInOptions({ callbackUrl }: SignInOptionsProps) {
  const form = useSignInForm(callbackUrl);

  return (
    <div className="flex flex-col gap-3">
      <GoogleSignInButton disabled={form.busy} onClick={() => void form.googleSignIn()} />

      <AuthDivider />

      <CredentialsForm
        mode={form.mode}
        email={form.email}
        password={form.password}
        confirm={form.confirm}
        error={form.error}
        isLoading={form.isLoading}
        busy={form.busy}
        onEmailChange={form.setEmail}
        onPasswordChange={form.setPassword}
        onConfirmChange={form.setConfirm}
        onSubmit={(e) => void form.submit(e)}
      />

      <ModeSwitch mode={form.mode} onSwitch={form.switchMode} />
    </div>
  );
}
