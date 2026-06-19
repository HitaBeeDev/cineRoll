import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/apiWithAuth";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ slug: string; id: string }> },
): Promise<Response> {
  const { slug, id } = await params;

  const res = await apiFetch(
    `/api/films/${encodeURIComponent(slug)}/comments/${encodeURIComponent(id)}`,
    { method: "DELETE" },
  );

  if (res.status === 204) {
    return new Response(null, { status: 204 });
  }

  const data = (await res.json().catch(() => ({}))) as unknown;
  return NextResponse.json(data, { status: res.status });
}
