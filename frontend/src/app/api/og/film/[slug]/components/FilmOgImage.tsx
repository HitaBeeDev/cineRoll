import type { FilmOgViewModel } from "../filmOgTypes";
import { FilmOgAccent } from "./FilmOgAccent";
import { FilmOgBackdrop } from "./FilmOgBackdrop";
import { FilmOgContent } from "./FilmOgContent";
import { FilmOgScrim } from "./FilmOgScrim";

type FilmOgImageProps = {
  film: FilmOgViewModel;
};

export function FilmOgImage({ film }: FilmOgImageProps) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#07070b",
        color: "#F5F5F0",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <FilmOgBackdrop backdropUrl={film.backdropUrl} />
      <FilmOgScrim />
      <FilmOgAccent accent={film.accent} />
      <FilmOgContent film={film} />
    </div>
  );
}
