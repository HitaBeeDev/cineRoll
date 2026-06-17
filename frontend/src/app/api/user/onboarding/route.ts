import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/apiWithAuth";

// Same-origin proxy: persist the first-visit onboarding genre preferences to
// the signed-in account (flushed from the client once the user signs in).
export async function POST(req: Request): Promise<Response> {
  const body = (await req.json().catch(() => null)) as unknown;

  const res = await apiFetch("/api/user/onboarding", {
    method: "POST",
    body: JSON.stringify(body ?? {}),
  });

  if (res.status === 204) {
    return new Response(null, { status: 204 });
  }

  const data = (await res.json().catch(() => ({}))) as unknown;
  return NextResponse.json(data, { status: res.status });
}
