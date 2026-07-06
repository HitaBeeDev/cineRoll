type FilmOgPosterProps = {
  accent: string;
  posterAlt: string;
  posterUrl: string | null;
  title: string;
};

export function FilmOgPoster({ accent, posterAlt, posterUrl, title }: FilmOgPosterProps) {
  if (!posterUrl) {
    return (
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
        {title}
      </div>
    );
  }

  return (
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
      <img src={posterUrl} alt={posterAlt} width={340} height={510} style={{ width: 340, height: 510, objectFit: "cover" }} />
    </div>
  );
}
