import { Request, Response, NextFunction } from "express";
import { jwtDecrypt } from "jose";
import { hkdfSync } from "crypto";

export type AuthedRequest = Request & { userId: string };

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

  const token = authHeader.slice(7);
  const secret = process.env["NEXTAUTH_SECRET"];
  if (!secret) {
    res
      .status(500)
      .json({ error: "Server misconfiguration", code: "MISSING_SECRET" });
    return;
  }

  try {
    const { payload } = await jwtDecrypt(
      token,
      (header) => deriveEncryptionKey(secret, header.enc ?? "A256CBC-HS512"),
      {
        clockTolerance: 15,
        contentEncryptionAlgorithms: ["A256GCM", "A256CBC-HS512"],
        keyManagementAlgorithms: ["dir"],
      },
    );

    const userId = (payload["sub"] ?? payload["userId"]) as string | undefined;
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
