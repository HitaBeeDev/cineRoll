import { FilmTexture } from "./film-texture";
import { HeroLetterbox } from "./hero-letterbox";

/**
 * The About hero's "projector" backdrop: a warm beam from the top left, film
 * texture and opening letterbox bars. Place it inside a
 * `relative isolate overflow-hidden` section; content goes on `z-10`.
 */
export function CinematicBackdrop() {
  return (
    <>
      <span
        aria-hidden
        className="pointer-events-none absolute -left-1/4 -top-1/3 -z-10 h-[140%] w-[90%] rotate-[-18deg] bg-[radial-gradient(ellipse_at_top_left,rgba(232,69,60,0.22),rgba(232,69,60,0.05)_40%,transparent_70%)] blur-2xl"
      />
      <FilmTexture />
      <HeroLetterbox />
    </>
  );
}
