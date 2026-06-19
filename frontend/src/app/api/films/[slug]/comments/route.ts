import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/apiWithAuth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const { slug } = await params;
  const { search } = new URL(req.url);

  const res = await apiFetch(`/api/films/${encodeURIComponent(slug)}/comments${search}`);
  const data = (await res.json().catch(() => ({}))) as unknown;
  return NextResponse.json(data, { status: res.status });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const { slug } = await params;
  const body = (await req.json().catch(() => null)) as unknown;

  const res = await apiFetch(`/api/films/${encodeURIComponent(slug)}/comments`, {
    method: "POST",
    body: JSON.stringify(body ?? {}),
  });

  const data = (await res.json().catch(() => ({}))) as unknown;
  return NextResponse.json(data, { status: res.status });
}
