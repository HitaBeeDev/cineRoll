import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/apiWithAuth";

/**
 * Same-origin proxy for the browse list, used only when the query carries a
 * per-viewer filter ("hide films I've watched").
 *
 * The browser cannot mint the backend's bearer token — `apiFetch` derives it
 * from the server-side session — so a request that has to know who is asking
 * goes through here. Everything else keeps calling the backend directly, where
 * it stays publicly cacheable (see films-client.ts).
 */
export async function GET(req: Request): Promise<Response> {
  const { search } = new URL(req.url);
  const res = await apiFetch(`/api/films${search}`);
  const data = (await res.json().catch(() => ({}))) as unknown;

  return NextResponse.json(data, {
    status: res.status,
    // One viewer's browse must not be reused for the next.
    headers: { "Cache-Control": "private, no-store" },
  });
}
