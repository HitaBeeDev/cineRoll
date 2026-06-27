import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, passwordIssue } from "@/lib/password";

// bcrypt + Prisma (pg) need the Node runtime, not edge.
export const runtime = "nodejs";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  name: z.string().trim().max(80).optional(),
});

export async function POST(req: Request) {
  const body: unknown = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email and password." }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase().trim();
  const issue = passwordIssue(parsed.data.password);
  if (issue) {
    return NextResponse.json({ error: issue }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists. Try signing in instead." },
      { status: 409 },
    );
  }

  const passwordHash = await hashPassword(parsed.data.password);
  await prisma.user.create({
    data: {
      email,
      name: parsed.data.name?.trim() || null,
      passwordHash,
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
