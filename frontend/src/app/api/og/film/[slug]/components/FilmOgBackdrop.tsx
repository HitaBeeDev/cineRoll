import { IMAGE_HEIGHT, IMAGE_WIDTH } from "../filmOgConfig";

type FilmOgBackdropProps = {
  backdropUrl: string | null;
};

export function FilmOgBackdrop({ backdropUrl }: FilmOgBackdropProps) {
  if (!backdropUrl) {
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          background: "linear-gradient(112deg, #07070b 0%, #15131d 46%, #07070b 100%)",
        }}
      />
    );
  }

  return (
    <img
      src={backdropUrl}
      alt=""
      width={IMAGE_WIDTH}
      height={IMAGE_HEIGHT}
      style={{ position: "absolute", inset: 0, width: IMAGE_WIDTH, height: IMAGE_HEIGHT, objectFit: "cover" }}
    />
  );
}
