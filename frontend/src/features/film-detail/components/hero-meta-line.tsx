import { formatFilmYear } from "@/lib/format";
import { MetaDot } from "./meta-dot";
import type { HeroMetaLineProps } from "../component-props";

export function HeroMetaLine(props: HeroMetaLineProps) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 font-[family-name:var(--font-geist-mono)] text-[13px] tracking-[0.02em] text-white/65">
      <span>{formatFilmYear(props.film)}</span>
      {props.runtime && (
        <>
          <MetaDot />
          <span>{props.runtime}</span>
        </>
      )}
      {props.language && (
        <>
          <MetaDot />
          <span>{props.language}</span>
        </>
      )}
      {props.film.certificate && (
        <span
          className="ml-0.5 rounded border px-1.5 py-0.5 text-[10px] font-bold leading-none tracking-[0.16em]"
          style={{ color: props.accent, borderColor: `${props.accent}66` }}
        >
          {props.film.certificate}
        </span>
      )}
    </div>
  );
}
