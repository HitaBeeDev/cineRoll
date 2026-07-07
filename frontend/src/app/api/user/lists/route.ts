import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/apiWithAuth";

// Forwards the optional ?filmId membership flag through to the backend so the
// "Save to list" popover learns which lists already hold the film.
export async function GET(req: Request): Promise<Response> {
  const { search } = new URL(req.url);
  const res = await apiFetch(`/api/user/lists${search}`);
  const data = (await res.json().catch(() => ({}))) as unknown;
  return NextResponse.json(data, { status: res.status });
}

export async function POST(req: Request): Promise<Response> {
  const body = (await req.json().catch(() => null)) as unknown;
  const res = await apiFetch("/api/user/lists", {
    method: "POST",
    body: JSON.stringify(body ?? {}),
  });
  const data = (await res.json().catch(() => ({}))) as unknown;
  return NextResponse.json(data, { status: res.status });
}
