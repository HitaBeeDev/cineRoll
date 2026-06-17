import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/apiWithAuth";

// Same-origin proxy for reading the signed-in user's combined status for a
// single film (watched / sentiment / watchlist) — used to reflect existing
// state in the post-roll card's icons on mount.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ filmId: string }> },
): Promise<Response> {
  const { filmId } = await params;

  const res = await apiFetch(`/api/user/film-status/${encodeURIComponent(filmId)}`);

  const data = (await res.json().catch(() => ({}))) as unknown;
  return NextResponse.json(data, { status: res.status });
}
