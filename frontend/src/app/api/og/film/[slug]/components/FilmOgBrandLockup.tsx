type FilmOgBrandLockupProps = {
  accent: string;
  label: string;
};

export function FilmOgBrandLockup({ accent, label }: FilmOgBrandLockupProps) {
  return (
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
        {label}
      </div>
    </div>
  );
}
