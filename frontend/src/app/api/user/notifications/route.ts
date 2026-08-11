import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/apiWithAuth";

export async function GET(): Promise<Response> {
  const res = await apiFetch("/api/user/notifications");
  const data = (await res.json().catch(() => ({}))) as unknown;
  return NextResponse.json(data, { status: res.status });
}
