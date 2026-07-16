import type { PolicySectionProps } from "../component-props";

export function PolicySection({ title, children }: PolicySectionProps) {
  return (
    <section className="space-y-4">
      <h2 className="font-[family-name:var(--font-geist-mono)] text-[11px] font-semibold uppercase tracking-[0.4em] text-[#e8453c]">
        {title}
      </h2>
      <div className="space-y-4 text-sm leading-7 text-[#c8c8d8] [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
        {children}
      </div>
    </section>
  );
}
