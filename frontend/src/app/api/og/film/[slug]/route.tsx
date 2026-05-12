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
    film.isPickOfDay ? "Tonight's Pick" : null,
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
  if (title.length > 42) return 58;
  if (title.length > 30) return 68;
  if (title.length > 20) return 78;
  return 92;
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
  const shareUrl = new URL(`/film/${film.slug}`, SITE_URL).toString();

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
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background: `linear-gradient(112deg, #07070b 0%, #11111b 48%, #07070b 100%)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            right: -130,
            top: -170,
            width: 560,
            height: 560,
            borderRadius: 560,
            background: `${accent}33`,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 290,
            bottom: -240,
            width: 560,
            height: 560,
            borderRadius: 560,
            background: "#e8453c24",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            width: "100%",
            height: "100%",
            padding: 54,
            gap: 54,
          }}
        >
          <div
            style={{
              display: "flex",
              width: 340,
              height: 510,
              border: "1px solid rgba(255,255,255,0.14)",
              backgroundColor: "#11111b",
              boxShadow: `0 28px 80px rgba(0,0,0,0.72), 0 0 0 10px ${accent}12`,
              overflow: "hidden",
            }}
          >
            {film.posterUrl ? (
              <img
                src={film.posterUrl}
                alt={`${film.title} poster`}
                width={340}
                height={510}
                style={{
                  width: 340,
                  height: 510,
                  objectFit: "cover",
                }}
              />
            ) : (
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  height: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 36,
                  textAlign: "center",
                  fontSize: 42,
                  lineHeight: 1.05,
                  color: "#F5F5F0",
                }}
              >
                {film.title}
              </div>
            )}
          </div>

          <div
            style={{
              display: "flex",
              flex: 1,
              minWidth: 0,
              flexDirection: "column",
              paddingTop: 18,
              paddingBottom: 4,
            }}
          >
            <div
              style={{
                display: "flex",
                color: accent,
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: 5,
                textTransform: "uppercase",
              }}
            >
              CineRoll Tonight
            </div>

            <div
              style={{
                display: "flex",
                marginTop: 42,
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  display: "flex",
                  color: "#8f8fa2",
                  fontSize: 28,
                  fontWeight: 700,
                }}
              >
                {film.year}
                {film.director ? ` / ${film.director}` : ""}
              </div>
              <div
                style={{
                  display: "flex",
                  marginTop: 16,
                  maxWidth: 650,
                  fontSize: getTitleSize(film.title),
                  fontWeight: 800,
                  lineHeight: 0.92,
                  letterSpacing: -2,
                }}
              >
                {film.title}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                marginTop: 34,
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              {badges.slice(0, 5).map((badge) => (
                <div
                  key={badge}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    border: "1px solid rgba(255,255,255,0.14)",
                    backgroundColor: "rgba(0,0,0,0.28)",
                    color: badge === "Tonight's Pick" ? accent : "#d7d7e3",
                    padding: "10px 14px",
                    fontSize: 18,
                    fontWeight: 700,
                    letterSpacing: 1.4,
                    textTransform: "uppercase",
                  }}
                >
                  {badge}
                </div>
              ))}
            </div>

            {film.plot && (
              <div
                style={{
                  display: "flex",
                  marginTop: 34,
                  maxWidth: 650,
                  color: "#a4a4b8",
                  fontSize: 25,
                  lineHeight: 1.38,
                }}
              >
                {film.plot.length > 150 ? `${film.plot.slice(0, 147)}...` : film.plot}
              </div>
            )}

            <div style={{ display: "flex", flex: 1 }} />

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 24,
                borderTop: "1px solid rgba(255,255,255,0.1)",
                paddingTop: 24,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    width: 42,
                    height: 42,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#e8453c",
                    color: "#fff",
                    fontSize: 24,
                    fontWeight: 900,
                  }}
                >
                  C
                </div>
                <div
                  style={{
                    display: "flex",
                    fontSize: 30,
                    fontWeight: 900,
                    letterSpacing: -1,
                  }}
                >
                  CineRoll
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  color: "#8d8da0",
                  fontSize: 22,
                  fontWeight: 700,
                }}
              >
                {shareUrl.replace(/^https?:\/\//, "")}
              </div>
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
