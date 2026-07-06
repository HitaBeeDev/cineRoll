export function FilmOgScrim() {
  return (
    <>
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
    </>
  );
}
