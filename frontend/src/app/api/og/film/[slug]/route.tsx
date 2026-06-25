import { ImageResponse } from "next/og";
import type { Film } from "@cineroll/types";

export const runtime = "edge";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://cineroll.app");
const WIDTH = 1200;
const HEIGHT = 630;
const FALLBACK_ACCENT = "#D4AF37";

async function fetchFilm(slug: string): Promise<Film | null> {
  const res = await fetch(`${API_URL}/api/films/${encodeURIComponent(slug)}`, {
    next: { revalidate: 86400 },
  });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to fetch film: ${res.status}`);

  return (await res.json()) as Film;
}

function getAwardBadges(film: Film): string[] {
  return [
    film.imdbTopMovieRank !== null ? `IMDb Top 250 #${film.imdbTopMovieRank}` : null,
    film.imdbTopTvRank !== null ? `IMDb Top TV #${film.imdbTopTvRank}` : null,
    film.oscarWins > 0
      ? `${film.oscarWins} Oscar ${film.oscarWins === 1 ? "Win" : "Wins"}`
      : null,
    film.oscarWins === 0 && film.oscarNominations > 0
      ? `${film.oscarNominations} Oscar ${film.oscarNominations === 1 ? "Nom" : "Noms"}`
      : null,
    film.ggWins > 0
      ? `${film.ggWins} Globe ${film.ggWins === 1 ? "Win" : "Wins"}`
      : null,
    film.cannesWins > 0
      ? `${film.cannesWins} Cannes ${film.cannesWins === 1 ? "Win" : "Wins"}`
      : null,
  ].filter(Boolean) as string[];
}

function getTitleSize(title: string) {
  if (title.length > 42) return 60;
  if (title.length > 30) return 74;
  if (title.length > 20) return 88;
  return 104;
}

function getRatings(film: Film): { label: string; value: string; dot: string }[] {
  return [
    film.imdbRating != null
      ? { label: "IMDb", value: film.imdbRating.toFixed(1), dot: "#E3B53E" }
      : null,
    film.rtScore != null
      ? { label: "RT", value: `${film.rtScore}%`, dot: "#FA320A" }
      : null,
  ].filter(Boolean) as { label: string; value: string; dot: string }[];
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const film = await fetchFilm(slug);

  if (!film) {
    return new Response("Film not found", { status: 404 });
  }

  const accent = film.posterColor ?? FALLBACK_ACCENT;
  const badges = getAwardBadges(film);
  const ratings = getRatings(film);
  const shareUrl = new URL(`/film/${film.slug}`, SITE_URL).toString();
  const metaLine = [
    film.year ? String(film.year) : null,
    film.director,
    film.runtime ? `${film.runtime} min` : null,
  ]
    .filter(Boolean)
    .join("   ·   ");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          backgroundColor: "#07070b",
          color: "#F5F5F0",
          fontFamily: "Arial, sans-serif",
        }}
      >
        {/* Full-bleed backdrop (cinematic key art) — or an accent wash when the
            film has no backdrop, so the layout never falls back to flat black. */}
        {film.backdropUrl ? (
          <img
            src={film.backdropUrl}
            alt=""
            width={WIDTH}
            height={HEIGHT}
            style={{ position: "absolute", inset: 0, width: WIDTH, height: HEIGHT, objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              background: `linear-gradient(112deg, #07070b 0%, #15131d 46%, #07070b 100%)`,
            }}
          />
        )}

        {/* Left-weighted scrim keeps the poster + text legible while letting the
            backdrop breathe on the right. */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background:
              "linear-gradient(100deg, rgba(7,7,11,0.97) 0%, rgba(7,7,11,0.93) 42%, rgba(7,7,11,0.72) 72%, rgba(7,7,11,0.5) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background: "linear-gradient(0deg, rgba(7,7,11,0.9) 0%, rgba(7,7,11,0) 36%)",
          }}
        />
        {/* Accent glow + top hairline tie the card to the film's poster colour. */}
        <div
          style={{
            position: "absolute",
            right: -170,
            top: -210,
            width: 640,
            height: 640,
            borderRadius: 640,
            background: `${accent}2e`,
          }}
        />
        <div
          style={{ position: "absolute", left: 0, top: 0, right: 0, height: 8, display: "flex", background: accent }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            width: "100%",
            height: "100%",
            padding: 60,
            gap: 58,
            alignItems: "center",
          }}
        >
          {/* Poster — the hero. Bigger, ringed in the accent colour, deep shadow. */}
          {film.posterUrl ? (
            <div
              style={{
                display: "flex",
                width: 340,
                height: 510,
                borderRadius: 10,
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.16)",
                boxShadow: `0 40px 90px rgba(0,0,0,0.8), 0 0 0 8px ${accent}1f`,
              }}
            >
              <img
                src={film.posterUrl}
                alt={`${film.title} poster`}
                width={340}
                height={510}
                style={{ width: 340, height: 510, objectFit: "cover" }}
              />
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                width: 340,
                height: 510,
                borderRadius: 10,
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                padding: 36,
                fontSize: 44,
                lineHeight: 1.05,
                border: "1px solid rgba(255,255,255,0.16)",
                backgroundColor: "#11111b",
              }}
            >
              {film.title}
            </div>
          )}

          {/* Identity column */}
          <div style={{ display: "flex", flex: 1, minWidth: 0, height: 510, flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  display: "flex",
                  width: 36,
                  height: 36,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#e8453c",
                  color: "#fff",
                  fontSize: 22,
                  fontWeight: 900,
                }}
              >
                C
              </div>
              <div
                style={{
                  display: "flex",
                  color: accent,
                  fontSize: 22,
                  fontWeight: 700,
                  letterSpacing: 6,
                  textTransform: "uppercase",
                }}
              >
                {film.isPickOfDay ? "CineRoll · Tonight's Pick" : "CineRoll"}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                marginTop: 26,
                maxWidth: 720,
                fontSize: getTitleSize(film.title),
                fontWeight: 800,
                lineHeight: 0.94,
                letterSpacing: -2,
              }}
            >
              {film.title}
            </div>

            {metaLine && (
              <div style={{ display: "flex", marginTop: 22, color: "#bdbdcb", fontSize: 27, fontWeight: 600 }}>
                {metaLine}
              </div>
            )}

            <div style={{ display: "flex", marginTop: 30, gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              {ratings.map((r) => (
                <div
                  key={r.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    border: "1px solid rgba(255,255,255,0.16)",
                    backgroundColor: "rgba(0,0,0,0.34)",
                    padding: "10px 16px",
                  }}
                >
                  <div style={{ display: "flex", width: 10, height: 10, borderRadius: 10, background: r.dot }} />
                  <div style={{ display: "flex", fontSize: 23, fontWeight: 800, color: "#fff" }}>{r.value}</div>
                  <div
                    style={{
                      display: "flex",
                      fontSize: 16,
                      fontWeight: 700,
                      letterSpacing: 1.4,
                      textTransform: "uppercase",
                      color: "#9a9aaa",
                    }}
                  >
                    {r.label}
                  </div>
                </div>
              ))}
              {badges.slice(0, 3).map((badge) => (
                <div
                  key={badge}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    border: "1px solid rgba(255,255,255,0.16)",
                    backgroundColor: "rgba(0,0,0,0.3)",
                    color: "#d7d7e3",
                    padding: "10px 16px",
                    fontSize: 18,
                    fontWeight: 700,
                    letterSpacing: 1.2,
                    textTransform: "uppercase",
                  }}
                >
                  {badge}
                </div>
              ))}
            </div>

            {film.plot && (
              <div style={{ display: "flex", marginTop: 28, maxWidth: 680, color: "#a4a4b8", fontSize: 24, lineHeight: 1.4 }}>
                {film.plot.length > 150 ? `${film.plot.slice(0, 147)}...` : film.plot}
              </div>
            )}

            <div style={{ display: "flex", flex: 1 }} />

            <div style={{ display: "flex", color: "#8d8da0", fontSize: 20, fontWeight: 700, letterSpacing: 1 }}>
              {shareUrl.replace(/^https?:\/\//, "")}
            </div>
          </div>
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
