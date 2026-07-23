type RegisterResult = { ok: true } | { ok: false; error: string };

/** Creates a new credentials account via the register API, returning a
 *  user-friendly error message on failure. */
export async function registerAccount(
  email: string,
  password: string,
): Promise<RegisterResult> {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    return {
      ok: false,
      error: data?.error ?? "Could not create your account. Please try again.",
    };
  }

  return { ok: true };
}
