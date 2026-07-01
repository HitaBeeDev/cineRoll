import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { isValidAvatarId } from "@/lib/avatars";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const schema = z.object({ avatar: z.string() });

export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: unknown = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  // Only ids from the curated catalog are storable — never arbitrary strings.
  if (!parsed.success || !isValidAvatarId(parsed.data.avatar)) {
    return NextResponse.json({ error: "Invalid avatar." }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: userId },
    data: { image: parsed.data.avatar },
  });

  return NextResponse.json({ ok: true });
}
