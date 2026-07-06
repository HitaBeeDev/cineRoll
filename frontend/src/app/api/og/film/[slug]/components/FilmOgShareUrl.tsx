type FilmOgShareUrlProps = {
  displayShareUrl: string;
};

export function FilmOgShareUrl({ displayShareUrl }: FilmOgShareUrlProps) {
  return (
    <div style={{ display: "flex", color: "#8d8da0", fontSize: 20, fontWeight: 700, letterSpacing: 1 }}>
      {displayShareUrl}
    </div>
  );
}
