import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/apiWithAuth";

// POST — add a film to the list. { filmId }
export async function POST(
  req: Request,
  { params }: { params: Promise<{ listId: string }> },
): Promise<Response> {
  const { listId } = await params;
  const body = (await req.json().catch(() => null)) as unknown;
  const res = await apiFetch(`/api/user/lists/${encodeURIComponent(listId)}/films`, {
    method: "POST",
    body: JSON.stringify(body ?? {}),
  });
  const data = (await res.json().catch(() => ({}))) as unknown;
  return NextResponse.json(data, { status: res.status });
}
