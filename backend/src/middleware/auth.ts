import { Request, Response, NextFunction } from "express";
import { jwtDecrypt } from "jose";
import { hkdfSync } from "crypto";

export type AuthedRequest = Request & { userId: string };

// Salt matches the Auth.js default session cookie name
const SALT = "authjs.session-token";

function deriveEncryptionKey(secret: string): Uint8Array {
  return new Uint8Array(
    hkdfSync(
      "sha256",
      secret,
      SALT,
      `Auth.js Generated Encryption Key (${SALT})`,
      32,
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
    const key = deriveEncryptionKey(secret);
    const { payload } = await jwtDecrypt(token, key, {
      clockTolerance: 15,
      contentEncryptionAlgorithms: ["A256GCM", "A256CBC-HS512"],
      keyManagementAlgorithms: ["dir"],
    });

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
