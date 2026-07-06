import type { FilmOgViewModel } from "../filmOgTypes";
import { FilmOgBrandLockup } from "./FilmOgBrandLockup";
import { FilmOgMetaLine } from "./FilmOgMetaLine";
import { FilmOgPlot } from "./FilmOgPlot";
import { FilmOgShareUrl } from "./FilmOgShareUrl";
import { FilmOgSignalList } from "./FilmOgSignalList";
import { FilmOgTitle } from "./FilmOgTitle";

type FilmOgIdentityColumnProps = {
  film: FilmOgViewModel;
};

export function FilmOgIdentityColumn({ film }: FilmOgIdentityColumnProps) {
  return (
    <div style={{ display: "flex", flex: 1, minWidth: 0, height: 510, flexDirection: "column" }}>
      <FilmOgBrandLockup accent={film.accent} label={film.brandLabel} />
      <FilmOgTitle size={film.titleSize} title={film.title} />
      <FilmOgMetaLine metaLine={film.metaLine} />
      <FilmOgSignalList badges={film.badges} ratings={film.ratings} />
      <FilmOgPlot plot={film.plot} />
      <div style={{ display: "flex", flex: 1 }} />
      <FilmOgShareUrl displayShareUrl={film.displayShareUrl} />
    </div>
  );
}
