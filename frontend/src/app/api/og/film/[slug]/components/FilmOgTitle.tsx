type FilmOgTitleProps = {
  size: number;
  title: string;
};

export function FilmOgTitle({ size, title }: FilmOgTitleProps) {
  return (
    <div
      style={{
        display: "flex",
        marginTop: 26,
        maxWidth: 720,
        fontSize: size,
        fontWeight: 800,
        lineHeight: 0.94,
        letterSpacing: -2,
      }}
    >
      {title}
    </div>
  );
}
