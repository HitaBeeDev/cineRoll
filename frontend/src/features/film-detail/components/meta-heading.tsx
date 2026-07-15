import type { ChildrenProps } from "../component-props";

export function MetaHeading({ children }: ChildrenProps) {
  return (
    <p className="font-[family-name:var(--font-geist-mono)] text-[11px] font-semibold uppercase tracking-[0.4em] text-[#7c7ca0]">
      {children}
    </p>
  );
}
