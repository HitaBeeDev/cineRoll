import type { FilmOgViewModel } from "../filmOgTypes";
import { FilmOgIdentityColumn } from "./FilmOgIdentityColumn";
import { FilmOgPoster } from "./FilmOgPoster";

type FilmOgContentProps = {
  film: FilmOgViewModel;
};

export function FilmOgContent({ film }: FilmOgContentProps) {
  return (
    <div
      style={{
        position: "relative",
        zIndex: 1,
        display: "flex",
        width: "100%",
        height: "100%",
        padding: 60,
        gap: 58,
        alignItems: "center",
      }}
    >
      <FilmOgPoster accent={film.accent} posterAlt={film.posterAlt} posterUrl={film.posterUrl} title={film.title} />
      <FilmOgIdentityColumn film={film} />
    </div>
  );
}
