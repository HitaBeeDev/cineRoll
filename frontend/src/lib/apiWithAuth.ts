import { auth } from "@/auth";
import { encode } from "next-auth/jwt";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

// Must match the salt the backend (`requireAuth`) uses to derive its
// decryption key, otherwise the bridge token cannot be decoded.
const TOKEN_SALT = "authjs.session-token";

export async function apiFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const session = await auth();
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");

  if (session?.user?.id !== undefined) {
    const token = await encode({
      token: { sub: session.user.id, email: session.user.email ?? "" },
      secret: process.env["NEXTAUTH_SECRET"]!,
      salt: TOKEN_SALT,
      maxAge: 60 * 60,
    });
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(`${API_URL}${path}`, { ...init, headers });
}
