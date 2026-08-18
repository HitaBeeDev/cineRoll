import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/apiWithAuth";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password/verify-password";

export async function DELETE(req: Request): Promise<Response> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (user.passwordHash) {
    const body = (await req.json().catch(() => ({}))) as { currentPassword?: unknown };
    const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword : "";
    if (!currentPassword || !(await verifyPassword(currentPassword, user.passwordHash))) {
      return NextResponse.json(
        { error: "Enter your current password to confirm your identity." },
        { status: 400 },
      );
    }
  }

  const res = await apiFetch("/api/user/account", {
    method: "DELETE",
  });

  if (res.status === 204) {
    return new Response(null, { status: 204 });
  }

  const data = (await res.json().catch(() => ({}))) as unknown;
  return NextResponse.json(data, { status: res.status });
}
