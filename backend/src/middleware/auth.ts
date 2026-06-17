import { Request, Response, NextFunction } from "express";
import { jwtDecrypt } from "jose";
import { hkdfSync } from "crypto";

export type AuthedRequest = Request & { userId: string };
export type OptionallyAuthedRequest = Request & { userId?: string };

// Salt must match the one used when the frontend mints the token
// (src/lib/apiWithAuth.ts) and the Auth.js session cookie name.
const SALT = "authjs.session-token";

// Auth.js derives the key length from the content-encryption algorithm:
// A256CBC-HS512 needs 64 bytes, A256GCM needs 32. `encode()` defaults to
// A256CBC-HS512, while the session cookie uses A256GCM — support both.
function deriveEncryptionKey(secret: string, enc: string): Uint8Array {
  const length = enc === "A256CBC-HS512" ? 64 : 32;
  return new Uint8Array(
    hkdfSync(
      "sha256",
      secret,
      SALT,
      `Auth.js Generated Encryption Key (${SALT})`,
      length,
    ),
  );
}

async function getUserIdFromBearerToken(authHeader: string | undefined): Promise<string | null> {
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const secret = process.env["NEXTAUTH_SECRET"];
  if (!secret) {
    throw new Error("MISSING_SECRET");
  }

  const token = authHeader.slice(7);
  const { payload } = await jwtDecrypt(
    token,
    (header) => deriveEncryptionKey(secret, header.enc ?? "A256CBC-HS512"),
    {
      clockTolerance: 15,
      contentEncryptionAlgorithms: ["A256GCM", "A256CBC-HS512"],
      keyManagementAlgorithms: ["dir"],
    },
  );

  return (payload["sub"] ?? payload["userId"]) as string | null;
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized", code: "MISSING_TOKEN" });
    return;
  }

  const secret = process.env["NEXTAUTH_SECRET"];
  if (!secret) {
    res
      .status(500)
      .json({ error: "Server misconfiguration", code: "MISSING_SECRET" });
    return;
  }

  try {
    const userId = await getUserIdFromBearerToken(authHeader);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized", code: "INVALID_TOKEN" });
      return;
    }

    (req as AuthedRequest).userId = userId;
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized", code: "INVALID_TOKEN" });
  }
}

export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = await getUserIdFromBearerToken(req.headers.authorization);
    if (userId) {
      (req as OptionallyAuthedRequest).userId = userId;
    }
  } catch {
    // Event logging accepts anonymous traffic; malformed optional auth is ignored.
  }

  next();
}
