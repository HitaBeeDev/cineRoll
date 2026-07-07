import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/apiWithAuth";

// DELETE — remove a film from the list.
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ listId: string; filmId: string }> },
): Promise<Response> {
  const { listId, filmId } = await params;
  const res = await apiFetch(
    `/api/user/lists/${encodeURIComponent(listId)}/films/${encodeURIComponent(filmId)}`,
    { method: "DELETE" },
  );
  if (res.status === 204) return new Response(null, { status: 204 });
  const data = (await res.json().catch(() => ({}))) as unknown;
  return NextResponse.json(data, { status: res.status });
}
