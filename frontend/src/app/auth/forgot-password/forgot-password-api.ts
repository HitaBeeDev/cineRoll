const FORGOT_PASSWORD_ENDPOINT = "/api/auth/forgot-password";

/**
 * Requests a password-reset email. The endpoint intentionally never reveals
 * whether the address is registered, so this resolves regardless of outcome —
 * callers always show the same confirmation.
 */
export async function requestPasswordReset(email: string): Promise<void> {
  try {
    await fetch(FORGOT_PASSWORD_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
  } catch {
    // Swallowed on purpose — a network failure shows the same confirmation.
  }
}
