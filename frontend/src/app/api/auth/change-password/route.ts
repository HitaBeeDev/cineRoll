import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { hashPassword, passwordIssue, verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const schema = z.object({
  currentPassword: z.string().optional(),
  newPassword: z.string().min(1),
});

export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: unknown = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // An account that already has a password must prove knowledge of the current
  // one. An OAuth-only account (no hash yet) is setting a password for the first
  // time, so there's nothing to verify.
  if (user.passwordHash) {
    const current = parsed.data.currentPassword ?? "";
    if (!current || !(await verifyPassword(current, user.passwordHash))) {
      return NextResponse.json(
        { error: "Current password is incorrect." },
        { status: 400 },
      );
    }
  }

  const issue = passwordIssue(parsed.data.newPassword);
  if (issue) {
    return NextResponse.json({ error: issue }, { status: 400 });
  }

  const passwordHash = await hashPassword(parsed.data.newPassword);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

  return NextResponse.json({ ok: true });
}
