import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/apiWithAuth";

// Same-origin proxy for reading the signed-in user's watched status for a
// single film (used to pre-fill the post-roll sentiment prompt).
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ filmId: string }> },
): Promise<Response> {
  const { filmId } = await params;

  const res = await apiFetch(`/api/user/watched/${encodeURIComponent(filmId)}`);

  const data = (await res.json().catch(() => ({}))) as unknown;
  return NextResponse.json(data, { status: res.status });
}
