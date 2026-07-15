import type { ChildrenProps } from "../component-props";

export function SectionLabel({ children }: ChildrenProps) {
  return (
    <div className="flex items-center gap-4">
      <span className="font-[family-name:var(--font-geist-mono)] text-[11px] text-[#e8453c]">
        ◆
      </span>
      <h2 className="shrink-0 font-[family-name:var(--font-geist-mono)] text-[11px] font-semibold uppercase tracking-[0.5em] text-[#c8c8e0]">
        {children}
      </h2>
      <div className="h-px flex-1 bg-gradient-to-r from-[#2a2a42] to-transparent" />
    </div>
  );
}
