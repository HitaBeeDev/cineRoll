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

export async function DELETE(req: Request): Promise<Response> {
  const body = (await req.json().catch(() => null)) as { filmId?: unknown } | null;
  const filmId = typeof body?.filmId === "string" ? body.filmId : "";

  const res = await apiFetch(`/api/user/watchlist/${encodeURIComponent(filmId)}`, {
    method: "DELETE",
  });

  if (res.status === 204) {
    return new Response(null, { status: 204 });
  }

  const data = (await res.json().catch(() => ({}))) as unknown;
  return NextResponse.json(data, { status: res.status });
}
