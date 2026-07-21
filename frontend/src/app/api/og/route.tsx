import { ImageResponse } from "next/og";

// Node runtime (not "edge"): Vercel's multi-service deployments don't support
// Edge Function output. next/og's ImageResponse runs fine on Node.
export const runtime = "nodejs";

const WIDTH = 1200;
const HEIGHT = 630;
const ACCENT = "#D4AF37";

// Generic branded OG card used as the default social image for every page that
// doesn't ship its own (the film route renders a richer, data-driven card).
// Pass ?title= and ?subtitle= to label a specific page type,
// e.g. /api/og?title=Browse%20Films.
export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = (searchParams.get("title") ?? "").slice(0, 90);
  const subtitle =
    (searchParams.get("subtitle") ?? "Discover award-winning films with a roll of the dice.").slice(0, 140);

  const titleSize = title.length > 40 ? 66 : title.length > 24 ? 82 : 96;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
          padding: 80,
          backgroundColor: "#07070b",
          color: "#F5F5F0",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background: "linear-gradient(112deg, #07070b 0%, #15131d 48%, #07070b 100%)",
          }}
        />
        {/* Accent glow + top hairline */}
        <div
          style={{
            position: "absolute",
            right: -170,
            top: -210,
            width: 640,
            height: 640,
            borderRadius: 640,
            background: `${ACCENT}26`,
          }}
        />
        <div style={{ position: "absolute", left: 0, top: 0, right: 0, height: 8, display: "flex", background: ACCENT }} />

        {/* Brand lockup */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, position: "relative", zIndex: 1 }}>
          <div
            style={{
              display: "flex",
              width: 44,
              height: 44,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#e8453c",
              color: "#fff",
              fontSize: 28,
              fontWeight: 900,
            }}
          >
            C
          </div>
          <div style={{ display: "flex", color: ACCENT, fontSize: 26, fontWeight: 700, letterSpacing: 7, textTransform: "uppercase" }}>
            CineRoll
          </div>
        </div>

        <div style={{ display: "flex", flex: 1 }} />

        {/* Headline */}
        <div style={{ display: "flex", position: "relative", zIndex: 1, maxWidth: 1000, fontSize: titleSize, fontWeight: 800, lineHeight: 0.98, letterSpacing: -2 }}>
          {title || "CineRoll"}
        </div>
        <div style={{ display: "flex", position: "relative", zIndex: 1, marginTop: 28, maxWidth: 900, color: "#a4a4b8", fontSize: 30, fontWeight: 600, lineHeight: 1.35 }}>
          {subtitle}
        </div>

        <div style={{ display: "flex", flex: 1 }} />

        <div style={{ display: "flex", position: "relative", zIndex: 1, color: "#8d8da0", fontSize: 22, fontWeight: 700, letterSpacing: 1 }}>
          cineroll.app
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  );
}
