type FilmOgBadgeProps = {
  badge: string;
};

export function FilmOgBadge({ badge }: FilmOgBadgeProps) {
  return (
    <div
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
  );
}
