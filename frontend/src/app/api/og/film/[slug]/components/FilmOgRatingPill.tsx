import type { FilmOgRating } from "../filmOgTypes";

type FilmOgRatingPillProps = {
  rating: FilmOgRating;
};

export function FilmOgRatingPill({ rating }: FilmOgRatingPillProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        border: "1px solid rgba(255,255,255,0.16)",
        backgroundColor: "rgba(0,0,0,0.34)",
        padding: "10px 16px",
      }}
    >
      <div style={{ display: "flex", width: 10, height: 10, borderRadius: 10, background: rating.dotColor }} />
      <div style={{ display: "flex", fontSize: 23, fontWeight: 800, color: "#fff" }}>{rating.value}</div>
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
        {rating.label}
      </div>
    </div>
  );
}
