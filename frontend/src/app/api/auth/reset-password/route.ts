import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, passwordIssue } from "@/lib/password";

export const runtime = "nodejs";

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(1),
});

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export async function POST(req: Request) {
  const body: unknown = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const issue = passwordIssue(parsed.data.password);
  if (issue) {
    return NextResponse.json({ error: issue }, { status: 400 });
  }

  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: sha256(parsed.data.token) },
  });
  if (!record || record.expires < new Date()) {
    return NextResponse.json(
      { error: "This reset link is invalid or has expired. Request a new one." },
      { status: 400 },
    );
  }

  const passwordHash = await hashPassword(parsed.data.password);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      // Completing a reset proves control of the inbox — mark verified.
      data: { passwordHash, emailVerified: new Date() },
    }),
    // Burn every reset token for this user, including the one just used.
    prisma.passwordResetToken.deleteMany({ where: { userId: record.userId } }),
  ]);

  return NextResponse.json({ ok: true });
}
