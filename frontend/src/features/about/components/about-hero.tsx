import { GRAIN_TEXTURE } from "../grain-texture";
import { AwardNameReel } from "./award-name-reel";
import { HeroLetterbox } from "./hero-letterbox";

export function AboutHero() {
  return (
    <section className="relative isolate flex min-h-[78svh] items-center overflow-hidden border-b border-white/10 bg-[#07070b]">
      {/* Projector beam: a warm cone from the top left, fading into the dark. */}
      <span
        aria-hidden
        className="pointer-events-none absolute -left-1/4 -top-1/3 -z-10 h-[140%] w-[90%] rotate-[-18deg] bg-[radial-gradient(ellipse_at_top_left,rgba(232,69,60,0.22),rgba(232,69,60,0.05)_40%,transparent_70%)] blur-2xl"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.75)_100%)]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 opacity-[0.07] mix-blend-overlay"
        style={{ backgroundImage: GRAIN_TEXTURE, backgroundSize: "220px 220px" }}
      />
      <HeroLetterbox />
      <AwardNameReel />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-6 py-28 lg:px-10">
        <p className="flex items-center gap-3 font-[family-name:var(--font-geist-mono)] text-[11px] font-semibold uppercase tracking-[0.3em] text-accent">
          <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_14px_rgba(232,69,60,0.8)]" />
          About
        </p>
        <h1 className="mt-6 max-w-3xl font-[family-name:var(--font-display)] text-5xl font-bold leading-[1.02] tracking-tight text-fg-hi sm:text-7xl">
          What is <span className="italic text-accent-soft">CineRoll</span>?
        </h1>
        <p className="mt-7 max-w-xl text-lg leading-8 text-fg-muted">
          A catalogue of the films and series recognised by the four big awards — the Oscars, the
          Golden Globes, Cannes and the Berlinale — and a way to pick one to watch tonight.
        </p>
      </div>
    </section>
  );
}
