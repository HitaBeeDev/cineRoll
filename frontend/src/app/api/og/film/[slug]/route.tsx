import { ImageResponse } from "next/og";

import { FilmOgImage } from "./components/FilmOgImage";
import { IMAGE_HEIGHT, IMAGE_WIDTH, RESPONSE_HEADERS } from "./filmOgConfig";
import { fetchFilmBySlug } from "./filmOgRepository";
import { createFilmOgViewModel } from "./filmOgViewModel";

// Node runtime (not "edge"): Vercel's multi-service deployments don't support
// Edge Function output. next/og's ImageResponse runs fine on Node.
export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const film = await fetchFilmBySlug(slug);

  if (!film) {
    return new Response("Film not found", { status: 404 });
  }

  return new ImageResponse(<FilmOgImage film={createFilmOgViewModel(film)} />, {
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    headers: RESPONSE_HEADERS,
  });
}
