type FilmOgMetaLineProps = {
  metaLine: string;
};

export function FilmOgMetaLine({ metaLine }: FilmOgMetaLineProps) {
  if (!metaLine) return null;

  return (
    <div style={{ display: "flex", marginTop: 22, color: "#bdbdcb", fontSize: 27, fontWeight: 600 }}>
      {metaLine}
    </div>
  );
}
