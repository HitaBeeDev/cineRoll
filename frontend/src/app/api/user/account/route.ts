import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/apiWithAuth";

export async function DELETE(): Promise<Response> {
  const res = await apiFetch("/api/user/account", {
    method: "DELETE",
  });

  if (res.status === 204) {
    return new Response(null, { status: 204 });
  }

  const data = (await res.json().catch(() => ({}))) as unknown;
  return NextResponse.json(data, { status: res.status });
}
