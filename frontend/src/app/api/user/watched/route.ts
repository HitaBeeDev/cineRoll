import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/apiWithAuth";

// Same-origin proxy so client components can reach the authed backend
// endpoint: apiFetch mints the bridge token from the server-side session.
export async function POST(req: Request): Promise<Response> {
  const body = (await req.json().catch(() => null)) as unknown;

  const res = await apiFetch("/api/user/watched", {
    method: "POST",
    body: JSON.stringify(body ?? {}),
  });

  const data = (await res.json().catch(() => ({}))) as unknown;
  return NextResponse.json(data, { status: res.status });
}
