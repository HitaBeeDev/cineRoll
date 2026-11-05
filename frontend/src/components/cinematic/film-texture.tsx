import { GRAIN_TEXTURE } from "./grain-texture";

/**
 * Static film texture for dark heroes: an edge vignette and a fine grain layer.
 * No motion — each page brings its own animated motif on top of this.
 */
export function FilmTexture() {
  return (
    <>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.75)_100%)]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 opacity-[0.07] mix-blend-overlay"
        style={{ backgroundImage: GRAIN_TEXTURE, backgroundSize: "220px 220px" }}
      />
    </>
  );
}
