import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/apiWithAuth";

type Ctx = { params: Promise<{ listId: string }> };

// GET one list + its films (forwards cursor pagination).
export async function GET(req: Request, { params }: Ctx): Promise<Response> {
  const { listId } = await params;
  const { search } = new URL(req.url);
  const res = await apiFetch(`/api/user/lists/${encodeURIComponent(listId)}${search}`);
  const data = (await res.json().catch(() => ({}))) as unknown;
  return NextResponse.json(data, { status: res.status });
}

// PATCH — rename the list.
export async function PATCH(req: Request, { params }: Ctx): Promise<Response> {
  const { listId } = await params;
  const body = (await req.json().catch(() => null)) as unknown;
  const res = await apiFetch(`/api/user/lists/${encodeURIComponent(listId)}`, {
    method: "PATCH",
    body: JSON.stringify(body ?? {}),
  });
  const data = (await res.json().catch(() => ({}))) as unknown;
  return NextResponse.json(data, { status: res.status });
}

// DELETE — remove the whole list.
export async function DELETE(_req: Request, { params }: Ctx): Promise<Response> {
  const { listId } = await params;
  const res = await apiFetch(`/api/user/lists/${encodeURIComponent(listId)}`, {
    method: "DELETE",
  });
  if (res.status === 204) return new Response(null, { status: 204 });
  const data = (await res.json().catch(() => ({}))) as unknown;
  return NextResponse.json(data, { status: res.status });
}
