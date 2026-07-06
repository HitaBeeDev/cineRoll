type FilmOgAccentProps = {
  accent: string;
};

export function FilmOgAccent({ accent }: FilmOgAccentProps) {
  return (
    <>
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
    </>
  );
}
