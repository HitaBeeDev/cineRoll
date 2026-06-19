import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/apiWithAuth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ filmId: string }> },
): Promise<Response> {
  const { filmId } = await params;

  const res = await apiFetch(`/api/user/ratings/${encodeURIComponent(filmId)}`);

  const data = (await res.json().catch(() => ({}))) as unknown;
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ filmId: string }> },
): Promise<Response> {
  const { filmId } = await params;

  const res = await apiFetch(`/api/user/ratings/${encodeURIComponent(filmId)}`, {
    method: "DELETE",
  });

  if (res.status === 204) {
    return new Response(null, { status: 204 });
  }

  const data = (await res.json().catch(() => ({}))) as unknown;
  return NextResponse.json(data, { status: res.status });
}
