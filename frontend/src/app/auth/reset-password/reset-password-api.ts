const RESET_PASSWORD_ENDPOINT = "/api/auth/reset-password";
const RESET_PASSWORD_ERROR = "Could not reset your password. Please try again.";
const NETWORK_ERROR = "Something went wrong. Please try again.";

type ResetPasswordPayload = {
  token: string;
  password: string;
};

type ResetPasswordResult =
  | { ok: true }
  | {
      ok: false;
      error: string;
    };

type ResetPasswordErrorResponse = {
  error?: string;
};

export async function resetPassword(payload: ResetPasswordPayload): Promise<ResetPasswordResult> {
  try {
    const response = await fetch(RESET_PASSWORD_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return { ok: false, error: await readResetPasswordError(response) };
    }

    return { ok: true };
  } catch {
    return { ok: false, error: NETWORK_ERROR };
  }
}

async function readResetPasswordError(response: Response): Promise<string> {
  const data = (await response.json().catch(() => null)) as ResetPasswordErrorResponse | null;
  return data?.error ?? RESET_PASSWORD_ERROR;
}
