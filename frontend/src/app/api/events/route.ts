import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/apiWithAuth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (body === null) {
    return NextResponse.json(
      { error: "Invalid JSON body", code: "INVALID_JSON" },
      { status: 400 },
    );
  }

  const res = await apiFetch("/api/events", {
    method: "POST",
    body: JSON.stringify(body),
  });

  const payload = await res.json().catch(() => ({}));
  return NextResponse.json(payload, { status: res.status });
}
