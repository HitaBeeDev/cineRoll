import { createHash, randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";

export const runtime = "nodejs";

const schema = z.object({ email: z.string().email() });

const TOKEN_TTL_MS = 1000 * 60 * 30; // 30 minutes

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export async function POST(req: Request) {
  const body: unknown = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  // Always answer the same way: never reveal whether an email is registered.
  if (!parsed.success) {
    return NextResponse.json({ ok: true });
  }

  const email = parsed.data.email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email } });

  // Only OAuth-less accounts can reset a password; others silently no-op so we
  // don't disclose the account's existence or its sign-in method.
  if (user?.passwordHash) {
    const token = randomBytes(32).toString("hex");
    const tokenHash = sha256(token);

    // One live reset token per user — supersede any earlier request.
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
    await prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expires: new Date(Date.now() + TOKEN_TTL_MS) },
    });

    const base =
      process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? new URL(req.url).origin;
    const resetUrl = `${base}/auth/reset-password?token=${token}`;
    await sendPasswordResetEmail(user.email, resetUrl);
  }

  return NextResponse.json({ ok: true });
}
