import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/apiWithAuth";

export async function POST(req: Request): Promise<Response> {
  const body = (await req.json().catch(() => null)) as unknown;

  const res = await apiFetch("/api/user/watchlist", {
    method: "POST",
    body: JSON.stringify(body ?? {}),
  });

  const data = (await res.json().catch(() => ({}))) as unknown;
  return NextResponse.json(data, { status: res.status });
}
